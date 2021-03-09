import { LayersHandler, register } from '../../../../src/modules/map/store/layers.observer';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { $injector } from '../../../../src/injection';
import { WMTSGeoResource } from '../../../../src/services/domain/geoResources';


describe('layersObserver', () => {

	const geoResourceServiceMock = {
		async init() { },
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock);

		return store;
	};

	describe('register', () => {

		it('calls the handlers #init', () => {
			const store = setup();
			const mockHandler = jasmine.createSpyObj('handler', ['init']);

			register(store, mockHandler);

			expect(mockHandler.init).toHaveBeenCalledTimes(1);
		});


	});
	describe('LayersHandler', () => {

		describe('init', () => {


			it('it initializes the georesource service', () => {
				setup();
				const instanceUnderTest = new LayersHandler();

				const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve([
					new WMTSGeoResource('atkis', 'someLabel', 'someUrl')
				]));
				instanceUnderTest.init();

				expect(geoResourceServiceSpy).toHaveBeenCalledTimes(1);
			});

			it('it initializes the georesource service by configured bgId', async () => {
				const configuredBgId = 'atkis';
				const store = setup();
				const instanceUnderTest = new LayersHandler();

				spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve([
					new WMTSGeoResource(configuredBgId, 'someLabel0', 'someUrl0'),
					new WMTSGeoResource('some1', 'someLabel1', 'someUrl1'),
				]));
				await instanceUnderTest.init();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('it initializes the georesource service', async () => {
				const store = setup();
				const instanceUnderTest = new LayersHandler();
				spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve([
					new WMTSGeoResource('someId0', 'someLabel0', 'someUrl0'),
					new WMTSGeoResource('someId1', 'someLabel1', 'someUrl1')
				]));
				await instanceUnderTest.init();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('someId0');
			});
		});
	});
});