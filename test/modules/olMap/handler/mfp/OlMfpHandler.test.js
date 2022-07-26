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

describe('OlMfpHandler', () => {
	const initialState = {
		active: false,
		current: { id: 'foo', scale: null }
	};

	const translationServiceMock = { translate: (key) => key };

	const mapServiceMock = {
		getVisibleViewport: () => {
			return { top: 10, right: 20, bottom: 30, left: 40 };
		},
		getSrid: () => 3857,
		getDefaultGeodeticSrid: () => 25832
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
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('MfpService', mfpServiceMock);
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
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
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const getTarget = () => {
			const target = document.createElement('div');
			target.style.height = '100px';
			target.style.width = '100px';
			return target;
		};

		const setupMap = () => {
			return new Map({
				layers: [
					new TileLayer({
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: getTarget(),
				view: new View({
					center: initialCenter,
					zoom: 1
				})
			});
		};


		it('creates a mfp-layer', () => {
			setup({ ...initialState, active: true });
			const classUnderTest = new OlMfpHandler();
			const map = setupMap();
			spyOn(map, 'getSize').and.callFake(() => [100, 100]);
			spyOn(map, 'getCoordinateFromPixel').and.callFake(() => initialCenter);
			const layer = classUnderTest.activate(map);

			expect(layer).toBeTruthy();
		});
	});
});
