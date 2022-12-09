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
import { Polygon, Point, LineString } from 'ol/geom';
import { requestJob, setAutoRotation, setCurrent } from '../../../../../src/store/mfp/mfp.action';
import { changeCenter, changeRotation, changeZoom } from '../../../../../src/store/position/position.action';
import proj4 from 'proj4';
import { setMoveEnd } from '../../../../../src/store/map/map.action';




describe('OlMfpHandler', () => {
	const initialState = {
		active: false,
		current: { id: 'foo', scale: null, dpi: 125 },
		autoRotation: true
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
		const store = TestUtils.setupStoreAndDi(mfpState, { mfp: mfpReducer, position: positionReducer, map: mapReducer });
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
		spyOn(map, 'getSize').and.callFake(() => mapSize);
		spyOn(map, 'getCoordinateFromPixel').and.callFake(() => requestedCoordinate);
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
		expect(handler._mfpLayer).toBeNull();
		expect(handler._map).toBeNull();
		expect(handler._pageSize).toBeNull();
	});

	describe('when activated over olMap', () => {
		it('creates a mfp-layer', () => {
			setup();
			const classUnderTest = new OlMfpHandler();
			const map = setupMap();
			const layer = classUnderTest.activate(map);

			expect(layer).toBeTruthy();
		});

		it('registers observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._registeredObservers).toHaveSize(7);
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

		it('updates rotation after store changes', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const updateSpy = spyOn(handler, '_updateRotation').and.callFake(() => { });


			handler.activate(map);
			changeCenter([0, 42]);

			expect(updateSpy).toHaveBeenCalled();
			updateSpy.calls.reset();

			changeZoom(2);

			expect(updateSpy).toHaveBeenCalled();
			updateSpy.calls.reset();

			changeRotation(42);
			expect(updateSpy).toHaveBeenCalled();
			updateSpy.calls.reset();

			setAutoRotation(false);
			expect(updateSpy).toHaveBeenCalled();
			updateSpy.calls.reset();

			setAutoRotation(true);
			expect(updateSpy).toHaveBeenCalled();
		});

		it('synchronizes mfpPreview after store changes', () => {
			const map = setupMap();
			setup();
			const handler = new OlMfpHandler();
			const updateSpy = spyOn(handler, '_updateMfpPreview').and.callFake(() => { });

			handler.activate(map);
			updateSpy.calls.reset();
			setMoveEnd();

			expect(updateSpy).toHaveBeenCalledTimes(1);
		});

		describe('when autoRotation is false', () => {
			it('rotates the mfp-boundary', () => {
				const actualRotationInDegree = 90;
				const mockBoundary = new Polygon([[[0, 10], [10, 9], [10, 0], [0, -2], [0, 10]]]);
				const map = setupMap();
				setup({ ...initialState, scale: 42 });

				const handler = new OlMfpHandler();
				handler.activate(map);

				setAutoRotation(false);
				const geodeticBoundarySpy = spyOn(handler, '_createGeodeticBoundary').withArgs({ width: jasmine.any(Number), height: jasmine.any(Number) }, jasmine.any(Point)).and.callFake(() => mockBoundary);
				const mfpBoundarySpy = spyOn(handler, '_toMfpBoundary').withArgs(jasmine.any(Polygon), jasmine.any(Point), actualRotationInDegree).and.callFake(() => mockBoundary);

				changeRotation(actualRotationInDegree);

				expect(geodeticBoundarySpy).toHaveBeenCalledTimes(1);
				expect(mfpBoundarySpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('when autoRotation is true', () => {
			it('rotates the view', () => {
				const map = setupMap();
				const store = setup({ ...initialState, scale: 42 });

				const handler = new OlMfpHandler();
				handler.activate(map);

				expect(store.getState().position.rotation).toBeCloseTo(-0.03355, 5);
			});
		});

		it('encodes map to mfp spec after store changes', async () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			spyOn(mfpEncoderMock, 'encode').withArgs(map, { layoutId: 'foo', scale: 1, rotation: jasmine.any(Number), dpi: 125, pageCenter: jasmine.any(Point) }).and.callFake(() => { });
			const centerPointSpy = spyOn(handler, '_getVisibleCenterPoint').and.callThrough();
			const encodeSpy = spyOn(handler, '_encodeMap').and.callThrough();


			handler.activate(map);
			requestJob();

			await TestUtils.timeout();
			expect(encodeSpy).toHaveBeenCalled();
			expect(centerPointSpy).toHaveBeenCalled();


			encodeSpy.calls.reset();
			centerPointSpy.calls.reset();
			// autorotation off
			const azimuthSpy = spyOn(handler, '_getAzimuth').and.callFake(() => 42);
			setAutoRotation(false);
			requestJob();

			await TestUtils.timeout();
			expect(azimuthSpy).toHaveBeenCalled();
			expect(encodeSpy).toHaveBeenCalled();
			expect(centerPointSpy).toHaveBeenCalled();
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

	describe('_getAzimuth', () => {

		it('calculates the intermediate azimuth for a quadrangle polygon', () => {
			setup();
			const classUnderTest = new OlMfpHandler();
			const nonUniformQuadrangle = new Polygon([[[0, 10], [10, 9], [10, 0], [0, -2], [0, 10]]]);
			const squaredQuadrangle = new Polygon([[[0, 10], [10, 9], [10, 0], [0, -1], [0, 10]]]);
			const lineString = new LineString([[0, 10], [10, 9], [10, 0]]);
			const point = new Point([0, 10]);

			expect(classUnderTest._getAzimuth(nonUniformQuadrangle)).toBeCloseTo(0.048863, 4);
			expect(classUnderTest._getAzimuth(squaredQuadrangle)).toBeCloseTo(0.0, 5);

			expect(classUnderTest._getAzimuth(lineString)).toBeNull();
			expect(classUnderTest._getAzimuth(point)).toBeNull();

			expect(classUnderTest._getAzimuth(null)).toBeNull();
			expect(classUnderTest._getAzimuth(undefined)).toBeNull();

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

			expect(classUnderTest._createGeodeticBoundary(pageSize, center)).toEqual(jasmine.any(Polygon));
		});
	});
});
