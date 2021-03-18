import { LayersObserver } from '../../../../src/modules/map/store/LayersObserver';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { $injector } from '../../../../src/injection';
import { WMTSGeoResource } from '../../../../src/services/domain/geoResources';
import { QueryParameters } from '../../../../src/services/domain/queryParameters';


describe('LayersObserver', () => {

	const geoResourceServiceMock = {
		async init() { },
		all() { },
		byId() { }
	};

	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock });

		return store;
	};

	describe('register', () => {

		it('calls #_init and awaits its completion', async () => {
			const store = setup();
			const instanceUnderTest = new LayersObserver();
			const spy = spyOn(instanceUnderTest, '_init').and.returnValue(Promise.resolve(true));

			const result = await instanceUnderTest.register(store);

			expect(result).toBeTrue();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});


	describe('_init', () => {

		it('initializes the georesource service and calls #_addLayersFromConfig', async () => {
			setup();
			const instanceUnderTest = new LayersObserver();
			const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams');
			const addLayersFromConfigSpy = spyOn(instanceUnderTest, '_addLayersFromConfig');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve([
				new WMTSGeoResource('atkis', 'someLabel', 'someUrl')
			]));

			await instanceUnderTest._init();

			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(1);
			expect(addLayersFromQueryParamsSpy).not.toHaveBeenCalled();
			expect(addLayersFromConfigSpy).toHaveBeenCalledTimes(1);
		});

		it('initializes the georesource service and calls #_addLayersFromQueryParams', async () => {
			setup();
			const queryParam = QueryParameters.LAYER + '=some';
			const instanceUnderTest = new LayersObserver();
			const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams');
			const addLayersFromConfigSpy = spyOn(instanceUnderTest, '_addLayersFromConfig');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve([
				new WMTSGeoResource('atkis', 'someLabel', 'someUrl')
			]));
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest._init();

			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(addLayersFromQueryParamsSpy).toHaveBeenCalledOnceWith(new URLSearchParams(queryParam));
			expect(addLayersFromConfigSpy).not.toHaveBeenCalled();
		});

		describe('_addLayersFromConfig', () => {

			it('initializes the georesource service and adds the configured layer', () => {
				const configuredBgId = 'atkis';
				const store = setup();
				const instanceUnderTest = new LayersObserver();

				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some1', 'someLabel1', 'someUrl1'),
					new WMTSGeoResource(configuredBgId, 'someLabel0', 'someUrl0'),
				]);

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('initializes the georesource service and adds the first found layer ', () => {
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('someId0', 'someLabel0', 'someUrl0'),
					new WMTSGeoResource('someId1', 'someLabel1', 'someUrl1')
				]);

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('someId0');
			});
		});

		describe('_addLayersFromQueryParams', () => {

			it('initializes the georesource service', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = QueryParameters.LAYER + '=some0,some1';
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new WMTSGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new WMTSGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0');
				expect(store.getState().layers.active[1].id).toBe('some1');
			});

			it('initializes the georesource service considering layer visibility', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=true,false`;
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new WMTSGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new WMTSGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toBe('some1');
				expect(store.getState().layers.active[1].visible).toBeFalse();
			});

			it('initializes the georesource service considering layer visibility with unuseable params', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=some,thing`;
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new WMTSGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new WMTSGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toBe('some1');
				expect(store.getState().layers.active[1].visible).toBeTrue();
			});

			it('initializes the georesource service considering layer opacity', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=0.8,.6`;
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new WMTSGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new WMTSGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0');
				expect(store.getState().layers.active[0].opacity).toBe(0.8);
				expect(store.getState().layers.active[1].id).toBe('some1');
				expect(store.getState().layers.active[1].opacity).toBe(0.6);
			});

			it('initializes the georesource service considering layer opacity with unuseable params', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=some,thing`;
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new WMTSGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new WMTSGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0');
				expect(store.getState().layers.active[0].opacity).toBe(1);
				expect(store.getState().layers.active[1].id).toBe('some1');
				expect(store.getState().layers.active[1].opacity).toBe(1);
			});


			it('initializes the georesource service by calling #_addLayersFromConfig as fallback', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = QueryParameters.LAYER + '=unknown';
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some0', 'someLabel0', 'someUrl0'),
				]);

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('some0');
			});
		});
	});
});