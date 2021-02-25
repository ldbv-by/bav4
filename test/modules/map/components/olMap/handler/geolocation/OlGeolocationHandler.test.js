import { OlGeolocationHandler } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/OlGeolocationHandler';
import { TestUtils } from '../../../../../../test-utils';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';

import { OSM, TileDebug } from 'ol/source';

describe('OlGeolocationHandler', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialState = {
		/**
         * @property {boolean}
         */
		active: false,
		/**
         * @property {boolean}
         */
		denied: false,
    
		/**
         * @property {boolean}
         */
		tracking: false,
    
		/**
         * @property {number}
         */
		accuracy: null,
    
		/**
         * @property {array<number>}
         */
		position: null
	};
	const setup = (state = initialState) => {
		const geolocationState = {
			geolocation: state
		};
		TestUtils.setupStoreAndDi(geolocationState );
	};

	const setupMap =   () => {

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
	});
});