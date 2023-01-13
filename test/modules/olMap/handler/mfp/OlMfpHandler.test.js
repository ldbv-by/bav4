import { Feature } from 'ol';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { $injector } from '../../../../../src/injection';
import { OlMfpHandler } from '../../../../../src/modules/olMap/handler/mfp/OlMfpHandler';
import { mfpReducer } from '../../../../../src/store/mfp/mfp.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { mapReducer } from '../../../../../src/store/map/map.reducer';

import { TestUtils } from '../../../../test-utils';


import { register } from 'ol/proj/proj4';
import { Polygon, Point } from 'ol/geom';
import { requestJob, setCurrent } from '../../../../../src/store/mfp/mfp.action';
import { changeCenter } from '../../../../../src/store/position/position.action';
import proj4 from 'proj4';
import RenderEvent from 'ol/render/Event';
import { pointerReducer } from '../../../../../src/store/pointer/pointer.reducer';
import { setBeingDragged } from '../../../../../src/store/pointer/pointer.action';
import { setBeingMoved, setMoveStart as setMapMoveStart, setMoveEnd as setMapMoveEnd } from '../../../../../src/store/map/map.action';




describe('OlMfpHandler', () => {
	const initialState = {
		active: false,
		current: { id: 'foo', scale: null, dpi: 125 },
		showGrid: false
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
		getDefaultGeodeticSrid: () => 25832,
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
		encode: async () => { }
	};

	const setup = (state = initialState) => {
		const mfpState = {
			mfp: state
		};
		const store = TestUtils.setupStoreAndDi(mfpState, { mfp: mfpReducer, position: positionReducer, map: mapReducer, pointer: pointerReducer });
		$injector.registerSingleton('TranslationService', translationServiceMock)
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
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				new TileLayer({
					source: new TileDebug()
				})],
			target: getTarget(),
			view: new View({
				center: viewCenter,
				zoom: 1
			})
		});
		spyOn(map, 'getSize').and.callFake(() => [...mapSize]);
		spyOn(map, 'getCoordinateFromPixel').and.callFake(() => requestedCoordinate);
		spyOn(map, 'getPixelFromCoordinate').and.callFake(() => requestedCoordinate);
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
		expect(handler._pageSize).toBeNull();
	});

	describe('when activated over olMap', () => {
		const transform = [1, 0, 0, 1, 0, 0];
		const get2dContext = () => {
			const canvas = document.createElement('canvas');
			return canvas.getContext('2d');
		};
		const viewState = {
			projection: null, resolution: 1, rotation: 0
		};
		const setupFrameState = (time) => {
			return {
				time: +time, coordinateToPixelTransform: transform, viewHints: [], viewState: viewState
			};
		};

		const getRenderEvent = (time, eventName) => new RenderEvent(eventName, transform, setupFrameState(time), get2dContext());

		it('creates a mfp-layer with renderevent-handling', () => {
			setup();
			const classUnderTest = new OlMfpHandler();

			const prerenderEvent = getRenderEvent(Date.now() - 1000, 'prerender');
			const postrenderEvent = getRenderEvent(Date.now() - 1000, 'postrender');
			const saveContextSpy = spyOn(prerenderEvent.context, 'save').and.callThrough();
			const restoreContextSpy = spyOn(postrenderEvent.context, 'restore').and.callThrough();
			const map = setupMap([100, 100], [50, 50], [1, 1]);
			const layer = classUnderTest.activate(map);

			expect(layer).toBeTruthy();

			layer.dispatchEvent(prerenderEvent);
			expect(saveContextSpy).toHaveBeenCalled();

			layer.dispatchEvent(postrenderEvent);
			expect(restoreContextSpy).toHaveBeenCalled();
		});

		it('registers observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._registeredObservers).toHaveSize(6);
		});

		it('initializing mfpBoundaryFeature only once', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const mfpBoundaryFeatureSpy = spyOn(handler._mfpBoundaryFeature, 'setStyle').and.callThrough();


			handler.activate(map); // --> mfpLayer is now initialized
			const mfpLayerSpy = spyOn(handler._mfpLayer, 'on').withArgs('postrender', jasmine.any(Function)).and.callThrough();
			handler.activate(map);

			expect(mfpBoundaryFeatureSpy).toHaveBeenCalledOnceWith(jasmine.any(Array));

			expect(mfpLayerSpy).not.toHaveBeenCalled();
		});

		it('initializing mfpBoundaryFeature with a render style', () => {
			const map = setupMap();
			setup();
			const handler = new OlMfpHandler();
			const beingDraggedSpy = spyOn(handler, '_getBeingDragged').and.callThrough();

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

			const updateSpy = spyOn(handler, '_updateMfpPage').withArgs(current).and.callThrough();
			setCurrent(current);

			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates mfpPreview after store changes', () => {
			const center = [0, 0];
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler.activate(map);

			const updateSpy = spyOn(handler, '_updateMfpPreview').and.callThrough();
			changeCenter(center);

			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates internal beingDragged state immediately after store changes by user interaction with the map', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			handler._previewDelayTimeoutId = 1;
			setBeingDragged(true);

			expect(handler._beingDragged).toBeTrue();
			expect(handler._previewDelayTimeoutId).toBeNull();
		});

		it('updates internal beingDragged state immediately after store changes by app', async () => {
			const map = setupMap();
			const previewDelayTime = 0;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);
			setMapMoveStart();
			setBeingMoved(true);

			expect(handler._beingDragged).toBeTrue();
			expect(handler._previewDelayTimeoutId).toBeNull();

			// store changes by user and internal state is set by pointer.beingDragged-observer
			handler._previewDelayTimeoutId = 42;
			handler._beingDragged = false;

			setMapMoveStart();
			setBeingMoved(true);

			expect(handler._beingDragged).toBeFalse();
			expect(handler._previewDelayTimeoutId).toBe(42);
		});

		it('updates delayed mfpPreview after store changes by user interaction', async () => {
			const map = setupMap();
			const previewDelayTime = 10;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			setBeingDragged(true);
			const updateSpy = spyOn(handler, '_updateMfpPreview').and.callThrough();
			setBeingDragged(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(handler._beingDragged).toBeFalse();
			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates delayed mfpPreview after store changes by app', async () => {
			const map = setupMap();
			const previewDelayTime = 10;
			setup();

			const handler = new OlMfpHandler();
			handler._previewDelayTime = previewDelayTime;
			handler.activate(map);

			const updateSpy = spyOn(handler, '_delayedUpdateMfpPreview').and.callThrough();
			setMapMoveEnd();
			setBeingMoved(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(handler._beingDragged).toBeFalse();
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
			const updateSpy = spyOn(handler, '_delayedUpdateMfpPreview').and.callThrough();

			setMapMoveEnd();
			setBeingMoved(false);

			await TestUtils.timeout(previewDelayTime + 10);
			expect(handler._beingDragged).toBeFalse();
			expect(updateSpy).toHaveBeenCalled();
		});

		it('synchronizes mfpPreview after store changes', async () => {
			const map = setupMap();
			setup();
			const handler = new OlMfpHandler();
			const updateSpy = spyOn(handler, '_updateMfpPreview').and.callFake(() => { });

			handler.activate(map);
			updateSpy.calls.reset();
			changeCenter([0, 42]);

			expect(updateSpy).toHaveBeenCalledTimes(1);
		});

		it('requests the visible center point of the map, after store changes', async () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();

			const centerPointSpy = spyOn(handler, '_getVisibleCenterPoint').and.callThrough();

			handler.activate(map);
			requestJob();

			await TestUtils.timeout();
			expect(centerPointSpy).toHaveBeenCalled();
		});
	});

	describe('when deactivate', () => {
		it('unregisters observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			handler.activate(map);
			const spyOnUnregister = spyOn(handler, '_unregister').withArgs(handler._registeredObservers).and.callThrough();
			handler.deactivate(map);

			expect(handler._mfpLayer).toBeNull();
			expect(spyOnUnregister).toHaveBeenCalled();
		});
	});

	describe('_getPageLabel', () => {

		it('creates a pageLabel from mfpSettings', () => {
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getPageLabel({ id: 'foo', scale: 42 })).toBe('olMap_handler_mfp_id_foo 1:42');
			expect(classUnderTest._getPageLabel({ id: 'foo', scale: 42.21 })).toBe('olMap_handler_mfp_id_foo 1:42');
		});
	});

	describe('_getOptimalScale', () => {
		const mapSize = [200, 200];

		it('finds the largest as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.001);
			spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(1);
		});

		it('finds the medium as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.005);
			spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(21);
		});

		it('finds the smallest as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.01);
			spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(42);
		});

		it('finds the largest as fallback for a optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.0001);
			spyOn(view, 'getCenter').and.callFake(() => [42, 42]);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(1);
		});
	});

	describe('_createMfpBoundary', () => {
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
		const boundary = new Polygon([[[0, 10], [10, 9], [10, 0], [0, -1], [0, 10]]]);
		const cloned = new Polygon([[[0, 1], [1, 1], [1, 0], [0, 0], [0, 1]]]);
		const center = new Point([0, 0]);

		it('clone and transforms a geodetic boundary to a bundary with map projection', () => {
			setup();
			const cloneSpy = spyOn(boundary, 'clone').and.returnValue(cloned);
			const transformSpy = spyOn(cloned, 'transform').withArgs(jasmine.any(String), jasmine.any(String)).and.returnValue(cloned);

			const classUnderTest = new OlMfpHandler();

			const mfpBoundary = classUnderTest._toMfpBoundary(boundary, center, null);


			expect(cloneSpy).toHaveBeenCalled();
			expect(transformSpy).toHaveBeenCalled();
			expect(mfpBoundary).toBe(cloned);
		});

		it('clone,transforms and rotates a geodetic boundary to a boundary with map projection', () => {
			const mapRotation = 42;
			setup();
			const classUnderTest = new OlMfpHandler();
			const cloneSpy = spyOn(boundary, 'clone').and.returnValue(cloned);
			const transformSpy = spyOn(cloned, 'transform').withArgs(jasmine.any(String), jasmine.any(String)).and.returnValue(cloned);
			const rotationSpy = spyOn(cloned, 'rotate').and.returnValue(cloned);
			const mfpBoundary = classUnderTest._toMfpBoundary(boundary, center, mapRotation);


			expect(cloneSpy).toHaveBeenCalled();
			expect(transformSpy).toHaveBeenCalled();
			expect(rotationSpy).toHaveBeenCalledWith(mapRotation, [0, 0]);
			expect(mfpBoundary).toBe(cloned);
		});
	});
});
