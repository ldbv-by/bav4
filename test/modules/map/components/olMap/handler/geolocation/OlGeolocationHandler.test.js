import { OlGeolocationHandler } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/OlGeolocationHandler';
import { geolocationReducer } from '../../../../../../../src/modules/map/store/geolocation.reducer';
import { activate as activateGeolocation, setAccuracy, setPosition } from '../../../../../../../src/modules/map/store/geolocation.action';
import { TestUtils } from '../../../../../../test-utils';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';

import { OSM, TileDebug } from 'ol/source';

describe('OlGeolocationHandler', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialState = {
		active: false,
		denied: false,
		tracking: false,
		accuracy: null,
		position: null
	};
	const setup = (state = initialState) => {
		const geolocationState = {
			geolocation: state
		};
		TestUtils.setupStoreAndDi(geolocationState, { geolocation: geolocationReducer });
	};

	const setupMap = () => {

		return new Map({
			layers: [
				new TileLayer({
					source: new OSM(),
				}),
				new TileLayer({
					source: new TileDebug(),
				})],
			target: 'map',
			view: new View({
				center: initialCenter,
				zoom: 1,
			}),
		});

	};

	it('instantiates the handler', () => {
		setup();
		const handler = new OlGeolocationHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('geolocation_layer');
		expect(handler._storeService.getStore()).toBeDefined();
		expect(handler._unregister).not.toBeDefined();
	});

	describe('when activate', () => {
		it('registers observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlGeolocationHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._unregister).toBeDefined();
		});

		describe('when geolocation-state changed', () => {

			it('positions accuracy- and position-feature on position', () => {
				const map = setupMap();
				setup();


				const handler = new OlGeolocationHandler();
				handler.activate(map);

				setPosition([38, 57]);
				setAccuracy(42);
				activateGeolocation();

				expect(handler._accuracyFeature).toBeDefined();
				expect(handler._positionFeature).toBeDefined();

				expect(handler._accuracyFeature.getGeometry().getCenter()).toEqual([38, 57]);
				expect(handler._positionFeature.getGeometry().getCoordinates()).toEqual([38, 57]);
			});

		});
	});

	describe('when deactivate', () => {
		it('unregisters observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlGeolocationHandler();
			handler.activate(map);
			const spyOnUnregister = spyOn(handler, '_unregister');


			handler.deactivate(map);

			expect(handler._geolocationLayer).toBeNull();
			expect(spyOnUnregister).toHaveBeenCalled();
		});


	});
});