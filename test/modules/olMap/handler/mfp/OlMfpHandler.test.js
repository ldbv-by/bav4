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
import { TestUtils } from '../../../../test-utils';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { Polygon } from 'ol/geom';
import { thumbnailStyleFunction } from '../../../../../src/modules/olMap/handler/mfp/styleUtils';
import { setCurrent } from '../../../../../src/store/mfp/mfp.action';
import { changeCenter, changeLiveCenter, changeRotation, changeZoom } from '../../../../../src/store/position/position.action';

describe('OlMfpHandler', () => {
	const initialState = {
		active: false,
		current: { id: 'foo', scale: null }
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
			return Promise.resolve([]);
		},
		getCapabilitiesById() {
			return { scales: [42, 21, 1], mapSize: { width: 20, height: 20 } };
		}
	};

	const setup = (state = initialState) => {
		const mfpState = {
			mfp: state
		};
		TestUtils.setupStoreAndDi(mfpState, { mfp: mfpReducer, position: positionReducer });
		$injector.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('ConfigService', configService)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('MfpService', mfpServiceMock);
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
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

			expect(mfpBoundaryFeatureSpy).toHaveBeenCalledOnceWith(thumbnailStyleFunction);
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
			changeLiveCenter(center);

			expect(updateSpy).toHaveBeenCalled();
		});

		it('updates rotation after store changes', () => {
			const map = setupMap();
			setup();

			const handler = new OlMfpHandler();
			const updateSpy = spyOn(handler, '_updateRotation').and.callThrough();


			handler.activate(map);
			changeCenter([0, 42]);

			expect(updateSpy).toHaveBeenCalled();
			updateSpy.calls.reset();

			changeZoom(2);

			expect(updateSpy).toHaveBeenCalled();
			updateSpy.calls.reset();

			changeRotation(42);
			expect(updateSpy).toHaveBeenCalled();
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

			expect(classUnderTest._getAzimuth(nonUniformQuadrangle)).toBeCloseTo(0.048863, 4);
			expect(classUnderTest._getAzimuth(squaredQuadrangle)).toBeCloseTo(0.0, 5);
		});
	});

	describe('_getPageLabel', () => {

		it('creates a pageLabel from mfpSettings', () => {
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getPageLabel({ id: 'foo', scale: 42 })).toBe('olMap_handler_mfp_id_foo\n1:42');
			expect(classUnderTest._getPageLabel({ id: 'foo', scale: 42.21 })).toBe('olMap_handler_mfp_id_foo\n1:42');
		});
	});

	describe('_getOptimalScale', () => {
		const mapSize = [200, 200];

		it('finds the largest as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.0001);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(1);
		});

		it('finds the medium as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.005);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(21);
		});

		it('finds the smallest as optimal scale', () => {
			const map = setupMap(mapSize);
			const view = map.getView();
			spyOn(view, 'getResolution').and.callFake(() => 0.01);
			setup();
			const classUnderTest = new OlMfpHandler();

			expect(classUnderTest._getOptimalScale(map)).toBe(42);
		});
	});

	describe('_createMfpBoundary', () => {
		it('creates a polygon', () => {
			const pageSize = { width: 20, height: 20 };
			setup();
			const classUnderTest = new OlMfpHandler();
			classUnderTest._map = setupMap();
			const visibleViewPortSpy = spyOn(mapServiceMock, 'getVisibleViewport').and.callThrough();
			const sridSpy = spyOn(mapServiceMock, 'getSrid').and.callThrough();
			const geodeticSridSpy = spyOn(mapServiceMock, 'getDefaultGeodeticSrid').and.callThrough();

			expect(classUnderTest._createMpfBoundary(pageSize)).toEqual(jasmine.any(Polygon));
			expect(visibleViewPortSpy).toHaveBeenCalledTimes(1);
			expect(sridSpy).toHaveBeenCalledTimes(1);
			expect(geodeticSridSpy).toHaveBeenCalledTimes(1);
		});
	});
});
