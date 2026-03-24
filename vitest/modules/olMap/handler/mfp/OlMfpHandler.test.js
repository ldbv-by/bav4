import { Feature } from 'ol';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { $injector } from '@src/injection';
import { OlMfpHandler } from '@src/modules/olMap/handler/mfp/OlMfpHandler';
import { mfpReducer } from '@src/store/mfp/mfp.reducer';
import { positionReducer } from '@src/store/position/position.reducer';
import { mapReducer } from '@src/store/map/map.reducer';
import { TestUtils } from '@test/test-utils.js';
import { register } from 'ol/proj/proj4';
import { Polygon, Point, Geometry } from 'ol/geom';
import { requestJob, setCurrent, setGridSupported, setShowGrid } from '@src/store/mfp/mfp.action';
import { changeCenter, changeLiveZoom } from '@src/store/position/position.action';
import proj4 from 'proj4';
import RenderEvent from 'ol/render/Event';
import { pointerReducer } from '@src/store/pointer/pointer.reducer';
import { setBeingDragged } from '@src/store/pointer/pointer.action';
import { setBeingMoved, setMoveStart as setMapMoveStart, setMoveEnd as setMapMoveEnd } from '@src/store/map/map.action';
import { notificationReducer } from '@src/store/notifications/notifications.reducer';
import { observe } from '@src/utils/storeUtils';
import { simulateMapEvent } from '../../mapTestUtils';
import { DEFAULT_MAX_MFP_SPEC_SIZE_BYTES, MFP_ENCODING_ERROR_TYPE } from '@src/modules/olMap/services/Mfp3Encoder';
import { isTemplateResult } from '@src/utils/checks';
import { nothing } from 'lit-html';

describe('OlMfpHandler', () => {
	const initialState = {
		active: false,
		current: { id: 'foo', scale: null, dpi: 125 },
		showGrid: false,
		gridSupported: true
	};

	const configService = {
		getValue: (key, defaultValue) => defaultValue
	};

	const translationServiceMock = { translate: (key) => key };

	const mapServiceMock = {
		getVisibleViewport: () => {
			return { top: 10, right: 20, bottom: 30, left: 40 };
		},
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		getMinZoomLevel: () => 0,
		getMaxZoomLevel: () => 42
	};

	const mfpServiceMock = {
		getCapabilities() {
			return { srid: '25832', extent: [] };
		},
		getLayoutById() {
			return { scales: [42, 21, 1], mapSize: { width: 20, height: 20 } };
		}
	};

	const mfpEncoderMock = {
		encode: async () => {
			return { errors: [] };
		}
	};

	const setup = (state = initialState) => {
		const mfpState = {
			mfp: state
		};
		const store = TestUtils.setupStoreAndDi(mfpState, {
			mfp: mfpReducer,
			position: positionReducer,
			map: mapReducer,
			pointer: pointerReducer,
			notifications: notificationReducer
		});
		$injector
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('ConfigService', configService)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('MfpService', mfpServiceMock)
			.registerSingleton('ShareService', {})
			.registerSingleton('UrlService', {})
			.registerSingleton('GeoResourceService', {})
			.registerSingleton('Mfp3Encoder', mfpEncoderMock);
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
		return store;
	};

	const initialCenter = fromLonLat([11.57245, 48.14021]);

	const getTarget = () => {
		const target = document.createElement('div');
		target.style.height = '100px';
		target.style.width = '100px';
		return target;
	};

	const setupMap = (size = null, center = null, coordinateFromPixel = null) => {
		const mapSize = size ?? [100, 100];
		const viewCenter = center ?? initialCenter;
		const requestedCoordinate = coordinateFromPixel ?? initialCenter;
		const map = new Map({
			target: getTarget(),
			view: new View({
				center: viewCenter,
				zoom: 1
			})
		});
		vi.spyOn(map, 'getSize').and.callFake(() => [...mapSize]);
		vi.spyOn(map, 'getCoordinateFromPixel').and.callFake(() => requestedCoordinate);
		vi.spyOn(map, 'getPixelFromCoordinate').and.callFake(() => requestedCoordinate);
		return map;
	};

	it('instantiates the handler', () => {
		setup();
		const handler = new OlMfpHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('mfp_layer');
		expect(handler._storeService.getStore()).toBeDefined();
		expect(handler._registeredObservers).toEqual([]);
		expect(handler._mfpBoundaryFeature).toEqual(jasmine.any(Feature));
		expect(handler._previewDelayTime).toBe(1500);
		expect(handler._mfpLayer).toBeNull();
		expect(handler._map).toBeNull();
		expect(handler._mapListener).toBeNull();
		expect(handler._pageSize).toBeNull();
		expect(handler._alreadyWarned).toBe(false);
	});

	describe('when activated over olMap', () => {
		const transform = [1, 0, 0, 1, 0, 0];
		const get2dContext = () => {
			const canvas = document.createElement('canvas');
			return canvas.getContext('2d');
		};
		const viewState = {
			projection: null,
			resolution: 1,
			rotation: 0
		};
		const setupFrameState = (time) => {
			return {
				time: +time,
				coordinateToPixelTransform: transform,
				viewHints: [],
				viewState: viewState
			};
		};

		const getRenderEvent = (time, eventName) => new RenderEvent(eventName, transform, setupFrameState(time), get2dContext());

		it('creates a mfp-layer with renderevent-handling', () => {
			setup();
			const classUnderTest = new OlMfpHandler();

			const prerenderEvent = getRenderEvent(Date.now() - 1000, 'prerender');
			const postrenderEvent = getRenderEvent(Date.now() - 1000, 'postrender');
			const saveContextSpy = vi.spyOn(prerenderEvent.context, 'save');
			const restoreContextSpy = vi.spyOn(postrenderEvent.context, 'restore');
			const map = setupMap([100, 100], [50, 50], [1, 1]);
			const layer = classUnderTest.activate(map);

			expect(layer).toBeTruthy();
			classUnderTest._mfpBoundaryFeature.set('inSupportedArea', true);
			layer.dispatchEvent(prerenderEvent);
			expect(saveContextSpy).toHaveBeenCalled();

			layer.dispatchEvent(postrenderEvent);
			expect(restoreContextSpy).toHaveBeenCalled();
		});

		it('registers observer and mapListeners', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._registeredObservers).toHaveSize(7);
			expect(handler._mapListener).toEqual(jasmine.any(Object));
		});

		it('initializing mfpBoundaryFeature only once', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const mfpBoundaryFeatureSpy = vi.spyOn(handler._mfpBoundaryFeature, 'setStyle');

			handler.activate(map); // --> mfpLayer is now initialized
			const mfpLayerSpy = vi.spyOn(handler._mfpLayer, 'on').withArgs('postrender', jasmine.any(Function));
			handler.activate(map);

			expect(mfpBoundaryFeatureSpy).toHaveBeenCalledOnceWith(jasmine.any(Array));

			expect(mfpLayerSpy).not.toHaveBeenCalled();
		});

		it('initializes the mfpBoundaryFeature with a render style', () => {
			const map = setupMap();
			setup();
			const handler = new OlMfpHandler();
			const beingDraggedSpy = vi.spyOn(handler, '_getBeingDragged');

			handler.activate(map);
			handler._beingDragged = true;
			const style = handler._mfpBoundaryFeature.getStyle()[0];

			const renderFunction = style.getRenderer();
			const pixelCoordinates = [];
			const stateMock = { context: {} };
			renderFunction(pixelCoordinates, stateMock);

			expect(beingDraggedSpy).toHaveBeenCalled();
		});

		it('updates mfpPage after store changes', () => {
			const current = { id: 'bar', scale: 42 };
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler.activate(map);

			const updateSpy = vi.spyOn(handler, '_updateMfpPage').withArgs(current);
			setCurrent(current);

			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates mfpPreview after store changes', () => {
			const center = [0, 0];
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler.activate(map);

			const updateSpy = vi.spyOn(handler, '_updateMfpPreview');
			changeCenter(center);

			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates forceRenderFeature on map.precompose changes', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler.activate(map);
			handler._forceRenderFeature.setGeometry(new Point([0, 0]));
			const updateSpy = vi.spyOn(handler, '_updateForceRenderFeature');
			const geometrySpy = vi.spyOn(handler._forceRenderFeature, 'setGeometry').withArgs(jasmine.any(Geometry));
			simulateMapEvent(map, 'precompose');

			expect(updateSpy).toHaveBeenCalled();
			expect(geometrySpy).toHaveBeenCalled();
		});

		it('skips unnecessary updates to forceRenderFeature on map.precompose changes', () => {
			// map and view is init with the initialCenter
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler.activate(map);
			handler._forceRenderFeature.setGeometry(new Point(initialCenter));

			const updateSpy = vi.spyOn(handler, '_updateForceRenderFeature');
			const geometrySpy = vi.spyOn(handler._forceRenderFeature, 'setGeometry');
			// the center of the map is still initialCenter
			simulateMapEvent(map, 'precompose');

			expect(updateSpy).toHaveBeenCalled();
			expect(geometrySpy).not.toHaveBeenCalled();
		});

		it('updates internal beingDragged state immediately after store changes by user interaction with the map', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			// wait for first delayedPreview after activation
			await TestUtils.timeout(previewDelayTime + 10);
			handler._previewDelayTimeoutId = 1;
			setBeingDragged(true);

			expect(handler._beingDragged).toBe(true);
			expect(handler._previewDelayTimeoutId).toBeNull();
		});

		it('updates internal beingDragged state immediately after movestart store is changed by app', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			// wait for first delayedPreview after activation
			await TestUtils.timeout(previewDelayTime + 10);
			setMapMoveStart();
			setBeingMoved(true);

			expect(handler._beingDragged).toBe(true);
			expect(handler._previewDelayTimeoutId).toBeNull();

			// store changes by user and internal state is set by pointer.beingDragged-observer
			handler._previewDelayTimeoutId = 42;
			handler._beingDragged = false;

			setMapMoveStart();
			setBeingMoved(true);

			expect(handler._beingDragged).toBe(false);
			expect(handler._previewDelayTimeoutId).toBe(42);
		});

		it('updates internal beingDragged state immediately after liveZoom store is changed by app', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			// wait for first delayedPreview after activation
			await TestUtils.timeout(previewDelayTime + 10);
			changeLiveZoom();

			expect(handler._beingDragged).toBe(true);
			expect(handler._previewDelayTimeoutId).toBeNull();
		});

		it('updates delayed mfpPreview after store changes by user interaction', async () => {
			const map = setupMap();
			const previewDelayTime = 10;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			setBeingDragged(true);
			const updateSpy = vi.spyOn(handler, '_updateMfpPreview');
			setBeingDragged(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(handler._beingDragged).toBe(false);
			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates delayed mfpPreview after store changes by app', async () => {
			const map = setupMap();
			const previewDelayTime = 10;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			const updateSpy = vi.spyOn(handler, '_delayedUpdateMfpPreview');
			setMapMoveEnd();
			setBeingMoved(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(handler._beingDragged).toBe(false);
			expect(updateSpy).toHaveBeenCalled();
		});

		it('skips delayed mfpPreview after store changes by app, if delay is already started by user', async () => {
			const map = setupMap();
			const previewDelayTime = 10;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			handler._previewDelayTimeoutId = 42;
			const updateSpy = vi.spyOn(handler, '_delayedUpdateMfpPreview');
			const clearTimeoutSpy = vi
				.spyOn(global, 'clearTimeout')
				.withArgs(handler._previewDelayTimeoutId)
				.and.callFake(() => {});

			setMapMoveEnd();
			setBeingMoved(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(handler._beingDragged).toBe(false);
			expect(updateSpy).toHaveBeenCalledTimes(1);
			expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
		});

		it('synchronizes mfpPreview after store changes', async () => {
			const map = setupMap();
			setup();
			const handler = new OlMfpHandler();
			const updateSpy = vi.spyOn(handler, '_updateMfpPreview').and.callFake(() => {});

			handler.activate(map);
			updateSpy.calls.reset();
			changeCenter([0, 42]);

			expect(updateSpy).toHaveBeenCalledTimes(1);
		});

		it('requests the visible center point of the map, after store changes', async () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();

			const centerPointSpy = vi.spyOn(handler, '_getVisibleCenterPoint');

			handler.activate(map);
			requestJob();

			await TestUtils.timeout();
			expect(centerPointSpy).toHaveBeenCalled();
		});

		it('warns if preview is not in print area', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			vi.spyOn(handler, '_updateMfpPreview').and.callFake(() => {
				handler._mfpBoundaryFeature.set('inPrintableArea', false);
				handler._mfpBoundaryFeature.set('inSupportedArea', true);
			});
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			setBeingDragged(true);

			const warnOnceSpy = vi.spyOn(handler, '_warnOnce').and.callFake(() => {});
			setBeingDragged(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(warnOnceSpy).toHaveBeenCalledWith(jasmine.any(String));
		});

		it('warns NOT if preview is in print area', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			vi.spyOn(handler, '_updateMfpPreview').and.callFake(() => handler._mfpBoundaryFeature.set('inPrintableArea', true));
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			setBeingDragged(true);

			const warnOnceSpy = vi.spyOn(handler, '_warnOnce').and.callFake(() => {});
			setBeingDragged(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(warnOnceSpy).not.toHaveBeenCalled();
		});

		it('warns only ONCE', async () => {
			const warnText = 'FooBarBaz_WarnText';

			const store = setup();
			const notificationSpy = jasmine.createSpy('notification').and.callFake(() => {});
			observe(store, (state) => state.notifications.latest, notificationSpy);
			const handler = new OlMfpHandler();
			const warnOnceSpy = vi.spyOn(handler, '_warnOnce');

			handler._warnOnce(warnText);
			handler._warnOnce(warnText);
			handler._warnOnce(warnText);

			expect(warnOnceSpy).toHaveBeenCalledTimes(3);
			expect(notificationSpy).toHaveBeenCalledOnceWith(
				jasmine.objectContaining({ _payload: jasmine.objectContaining({ content: warnText }) }),
				jasmine.anything()
			);
		});

		it('warns with a i18n message for leaving printable area', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			const store = setup();
			const handler = new OlMfpHandler();
			vi.spyOn(handler, '_updateMfpPreview').and.callFake(() => {
				handler._mfpBoundaryFeature.set('inPrintableArea', false);
				handler._mfpBoundaryFeature.set('inSupportedArea', true);
			});
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			setBeingDragged(true);

			setBeingDragged(false);
			await TestUtils.timeout(previewDelayTime + 10);

			expect(store.getState().notifications.latest.payload.content).toBe('olMap_handler_mfp_distortion_warning');
		});

		it('warns about encoding errors after jobRequest', async () => {
			setup();
			const map = setupMap();

			const handler = new OlMfpHandler();
			const encodingResult = {
				errors: [
					{ label: 'foo', type: MFP_ENCODING_ERROR_TYPE.NOT_EXPORTABLE },
					{ label: 'bar', type: MFP_ENCODING_ERROR_TYPE.NOT_EXPORTABLE },
					{ label: 'baz', type: MFP_ENCODING_ERROR_TYPE.MISSING_GEORESOURCE }
				]
			};

			const notifySpy = vi.spyOn(handler, '_notifyAboutEncodingErrors');
			vi.spyOn(mfpEncoderMock, 'encode').and.resolveTo(encodingResult);
			handler.activate(map);
			requestJob();

			await TestUtils.timeout();
			expect(notifySpy).toHaveBeenCalledWith([
				{ label: 'foo', type: MFP_ENCODING_ERROR_TYPE.NOT_EXPORTABLE },
				{ label: 'bar', type: MFP_ENCODING_ERROR_TYPE.NOT_EXPORTABLE }
			]);
		});

		it('warns about encoding errors for encoding specs reaching max limit', async () => {
			const store = setup();
			const map = setupMap();
			const largeSpecsReachingEncodingLimit = { foo: 'bar', baz: 'something large' };
			const encodingResult = {
				specs: largeSpecsReachingEncodingLimit,
				errors: []
			};
			const limitFromConfig = JSON.stringify(largeSpecsReachingEncodingLimit).length - 10;
			const configSpy = vi.spyOn(configService, 'getValue').and.callFake(() => limitFromConfig);

			const handler = new OlMfpHandler();

			vi.spyOn(mfpEncoderMock, 'encode').and.resolveTo(encodingResult);

			handler.activate(map);
			requestJob();

			await TestUtils.timeout();
			expect(configSpy).toHaveBeenCalledOnceWith('MAX_MFP_SPEC_SIZE', DEFAULT_MAX_MFP_SPEC_SIZE_BYTES);

			expect(store.getState().notifications.latest.payload.content).toBe('olMap_handler_mfp_encoder_max_specs_limit_reached');
		});

		it('sets the encodingProperties properly', async () => {
			setup();
			const map = setupMap();

			const handler = new OlMfpHandler();
			handler._map = setupMap();
			handler._pageSize = { width: 20, height: 20 };
			vi.spyOn(handler, '_getMfpProjection').and.returnValue('EPSG:25832');

			handler._updateMfpPreview(new Point([0, 0]));

			const encodeSpy = vi.spyOn(mfpEncoderMock, 'encode');
			handler.activate(map);
			requestJob();

			await TestUtils.timeout();
			expect(encodeSpy).toHaveBeenCalledWith(
				map,
				jasmine.objectContaining({
					layoutId: jasmine.any(String),
					scale: jasmine.any(Number),
					rotation: jasmine.any(Number),
					dpi: jasmine.any(Number),
					pageCenter: jasmine.any(Point),
					pageExtent: jasmine.any(Array),
					showGrid: false
				})
			);

			setShowGrid(true);
			requestJob();

			await TestUtils.timeout();
			expect(encodeSpy).toHaveBeenCalledWith(
				map,
				jasmine.objectContaining({
					layoutId: jasmine.any(String),
					scale: jasmine.any(Number),
					rotation: jasmine.any(Number),
					dpi: jasmine.any(Number),
					pageCenter: jasmine.any(Point),
					pageExtent: jasmine.any(Array),
					showGrid: true
				})
			);
		});

		it('sets the encodingProperties properly, after mfp.gridSupported changed', async () => {
			setup();
			const map = setupMap();

			const handler = new OlMfpHandler();
			handler._map = setupMap();
			handler._pageSize = { width: 20, height: 20 };
			vi.spyOn(handler, '_getMfpProjection').and.returnValue('EPSG:25832');

			handler._updateMfpPreview(new Point([0, 0]));

			const encodeSpy = vi.spyOn(mfpEncoderMock, 'encode');
			handler.activate(map);
			setShowGrid(true);
			setGridSupported(false);
			requestJob();

			await TestUtils.timeout();
			expect(encodeSpy).toHaveBeenCalledWith(
				map,
				jasmine.objectContaining({
					layoutId: jasmine.any(String),
					scale: jasmine.any(Number),
					rotation: jasmine.any(Number),
					dpi: jasmine.any(Number),
					pageCenter: jasmine.any(Point),
					pageExtent: jasmine.any(Array),
					showGrid: false
				})
			);

			setGridSupported(true);
			requestJob();

			await TestUtils.timeout();
			expect(encodeSpy).toHaveBeenCalledWith(
				map,
				jasmine.objectContaining({
					layoutId: jasmine.any(String),
					scale: jasmine.any(Number),
					rotation: jasmine.any(Number),
					dpi: jasmine.any(Number),
					pageCenter: jasmine.any(Point),
					pageExtent: jasmine.any(Array),
					showGrid: true
				})
			);
		});
	});

	describe('when deactivate', () => {
		it('unregisters observer and reset session state', async () => {
			const previewDelayTime = 0;
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			// wait for first delayedPreview after activation
			await TestUtils.timeout(handler._previewDelayTime + 10);
			const spyOnUnregister = vi.spyOn(handler, '_unregister').withArgs(handler._registeredObservers);
			handler.deactivate(map);

			expect(handler._mfpLayer).toBeNull();
			expect(handler._visibleViewport).toBeNull();
			expect(handler._map).toBeNull();
			expect(handler._mapListener).toBeNull();
			expect(handler._mfpBoundaryFeature.getGeometry()).toBeNull();
			expect(handler._alreadyWarned).toBe(false);
			expect(spyOnUnregister).toHaveBeenCalled();
		});
	});

	describe('_getOptimalScale', () => {
		const mapSize = [200, 200];

		it('finds the largest as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			vi.spyOn(view, 'getResolution').and.callFake(() => 0.001);
			vi.spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(1);
		});

		it('finds the medium as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			vi.spyOn(view, 'getResolution').and.callFake(() => 0.005);
			vi.spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(21);
		});

		it('finds the smallest as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			vi.spyOn(view, 'getResolution').and.callFake(() => 0.01);
			vi.spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(42);
		});

		it('finds the largest as fallback for a optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			vi.spyOn(view, 'getResolution').and.callFake(() => 0.0001);
			vi.spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(1);
		});
	});

	describe('_updateMfpPreview', () => {
		const center = new Point([0, 0]);
		it('creates a projected polygon', () => {
			setup();
			const classUnderTest = new OlMfpHandler();
			classUnderTest._map = setupMap();
			classUnderTest._pageSize = { width: 20, height: 20 };
			vi.spyOn(classUnderTest, '_getMfpProjection').and.returnValue('EPSG:25832');

			classUnderTest._updateMfpPreview(center);

			expect(classUnderTest._mfpBoundaryFeature.getGeometry()).toEqual(jasmine.any(Polygon));
		});

		it('skips the preview on smerc projection', () => {
			setup();
			const classUnderTest = new OlMfpHandler();
			classUnderTest._map = setupMap();
			vi.spyOn(classUnderTest, '_getMfpProjection').and.returnValue('EPSG:3857');

			classUnderTest._updateMfpPreview(center);

			expect(classUnderTest._mfpBoundaryFeature.getGeometry()).toEqual(jasmine.any(Point));
		});

		it('skips the preview on non existing center ', () => {
			setup();
			const classUnderTest = new OlMfpHandler();
			classUnderTest._map = setupMap();
			vi.spyOn(classUnderTest, '_getMfpProjection').and.returnValue('EPSG:25832');

			classUnderTest._mfpBoundaryFeature.setGeometry(center);
			classUnderTest._updateMfpPreview(null);

			// the geometry of the mfpBoundaryFeature is NOT updated
			expect(classUnderTest._mfpBoundaryFeature.getGeometry()).toBe(center);
		});
	});

	describe('_createPagePolygon', () => {
		it('creates a polygon', () => {
			const pageSize = { width: 20, height: 20 };
			const center = new Point([0, 0]);

			setup();

			const classUnderTest = new OlMfpHandler();
			classUnderTest._map = setupMap();

			expect(classUnderTest._createPagePolygon(pageSize, center)).toEqual(jasmine.any(Polygon));
		});
	});

	describe('_toMfpBoundary', () => {
		const boundary = new Polygon([
			[
				[0, 10],
				[10, 9],
				[10, 0],
				[0, -1],
				[0, 10]
			]
		]);
		const cloned = new Polygon([
			[
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0],
				[0, 1]
			]
		]);
		const center = new Point([0, 0]);

		it('clones and transforms a geodetic boundary to a boundary with map projection', () => {
			setup();
			const cloneSpy = vi.spyOn(boundary, 'clone').and.returnValue(cloned);
			const transformSpy = vi.spyOn(cloned, 'transform').withArgs(jasmine.any(String), jasmine.any(String)).and.returnValue(cloned);

			const classUnderTest = new OlMfpHandler();

			const mfpBoundary = classUnderTest._toMfpBoundary(boundary, center, null);

			expect(cloneSpy).toHaveBeenCalled();
			expect(transformSpy).toHaveBeenCalled();
			expect(mfpBoundary).toBe(cloned);
		});

		it('clones,transforms and rotates a geodetic boundary to a boundary with map projection', () => {
			const mapRotation = 42;
			setup();
			const classUnderTest = new OlMfpHandler();
			const cloneSpy = vi.spyOn(boundary, 'clone').and.returnValue(cloned);
			const transformSpy = vi.spyOn(cloned, 'transform').withArgs(jasmine.any(String), jasmine.any(String)).and.returnValue(cloned);
			const rotationSpy = vi.spyOn(cloned, 'rotate').and.returnValue(cloned);
			const mfpBoundary = classUnderTest._toMfpBoundary(boundary, center, mapRotation);

			expect(cloneSpy).toHaveBeenCalled();
			expect(transformSpy).toHaveBeenCalled();
			expect(rotationSpy).toHaveBeenCalledWith(mapRotation, [0, 0]);
			expect(mfpBoundary).toBe(cloned);
		});
	});

	describe('_notifyAboutEncodingErrors', () => {
		it('notifies about layer based encoder errors', async () => {
			const store = setup();
			const errors = [
				{ label: 'foo', type: 'not_exportable' },
				{ label: 'bar', type: 'not_exportable' }
			];
			const classUnderTest = new OlMfpHandler();

			classUnderTest._notifyAboutEncodingErrors(errors);

			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBe(true);
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[0])).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[1]).toBe(nothing);
			expect(store.getState().notifications.latest.payload.content?.values[0].values[0]).toBe('olMap_handler_mfp_encoder_layer_not_exportable');
			expect(store.getState().notifications.latest.payload.content?.values[0].values[1]).toEqual(jasmine.any(Array));
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[0].values[1][0])).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[0].values[1][0].values).toEqual(['foo']);
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[0].values[1][1])).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[0].values[1][1].values).toEqual(['bar']);
		});

		it('notifies about feature based encoder errors', async () => {
			const store = setup();
			const errors = [
				{ label: 'foo', type: 'not_encodable_features' },
				{ label: 'bar', type: 'not_encodable_features' }
			];
			const classUnderTest = new OlMfpHandler();

			classUnderTest._notifyAboutEncodingErrors(errors);

			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[0]).toBe(nothing);
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[1])).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[1].values[0]).toBe('olMap_handler_mfp_encoder_features_invalid');
			expect(store.getState().notifications.latest.payload.content?.values[1].values[1]).toEqual(jasmine.any(Array));
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[1].values[1][0])).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[1].values[1][0].values).toEqual(['foo']);
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[1].values[1][1])).toBe(true);
			expect(store.getState().notifications.latest.payload.content?.values[1].values[1][1].values).toEqual(['bar']);
		});

		it('notifies about layer & feature based encoder errors', async () => {
			const store = setup();
			const errors = [
				{ label: 'foo', type: 'not_exportable' },
				{ label: 'bar', type: 'not_encodable_features' }
			];
			const classUnderTest = new OlMfpHandler();

			classUnderTest._notifyAboutEncodingErrors(errors);

			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBe(true);
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[0])).toBe(true);
			expect(isTemplateResult(store.getState().notifications.latest.payload.content?.values[1])).toBe(true);
		});
	});
});
