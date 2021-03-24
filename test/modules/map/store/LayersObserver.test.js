import { LayersObserver } from '../../../../src/modules/map/store/LayersObserver';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { $injector } from '../../../../src/injection';
import { WMTSGeoResource } from '../../../../src/services/domain/geoResources';
import { QueryParameters } from '../../../../src/services/domain/queryParameters';
import { Topic } from '../../../../src/services/domain/topic';
import { setCurrent } from '../../../../src/modules/topics/store/topics.action';
import { topicsReducer } from '../../../../src/modules/topics/store/topics.reducer';


describe('LayersObserver', () => {

	const geoResourceServiceMock = {
		async init() { },
		all() { },
		byId() { }
	};
	const topicsServiceMock = {
		default() { },
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
			layers: layersReducer,
			topics: topicsReducer
		});
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock)
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
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve());

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
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve());
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest._init();

			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(addLayersFromQueryParamsSpy).toHaveBeenCalledOnceWith(new URLSearchParams(queryParam));
			expect(addLayersFromConfigSpy).not.toHaveBeenCalled();
		});

		describe('_addLayersFromConfig', () => {

			it('adds the configured layer', () => {
				const store = setup();
				const configuredBgId = 'atkis';
				setCurrent(configuredBgId);
				const instanceUnderTest = new LayersObserver();

				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some1', 'someLabel1', 'someUrl1'),
					new WMTSGeoResource(configuredBgId, 'someLabel0', 'someUrl0'),
				]);
				// spyOn(topicsServiceMock, 'default').and.returnValue(new Topic('topicId', 'label', 'description', [configuredBgId]));
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', [configuredBgId]));


				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('dds the configured layer from default topic', () => {
				const store = setup();
				const configuredBgId = 'atkis';
				setCurrent(configuredBgId);
				const instanceUnderTest = new LayersObserver();

				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some1', 'someLabel1', 'someUrl1'),
					new WMTSGeoResource(configuredBgId, 'someLabel0', 'someUrl0'),
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(null);
				spyOn(topicsServiceMock, 'default').and.returnValue(new Topic('topicId', 'label', 'description', [configuredBgId]));

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('adds the first found layer ', () => {
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('someId0', 'someLabel0', 'someUrl0'),
					new WMTSGeoResource('someId1', 'someLabel1', 'someUrl1')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', ['somethingDifferent']));

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('someId0');
			});
		});

		describe('_addLayersFromQueryParams', () => {

			it('adds layer', () => {
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

			it('adds layer considering visibility', () => {
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

			it('adds layer considering unuseable visibility params', () => {
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

			it('adds layer considering opacity', () => {
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

			it('adds layer considering unuseable opacity params', () => {
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


			it('adds layer by calling #_addLayersFromConfig as fallback', () => {
				//geoResource service does not know id 'unknown'
				const queryParam = QueryParameters.LAYER + '=unknown';
				const store = setup();
				const instanceUnderTest = new LayersObserver();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some0', 'someLabel0', 'someUrl0'),
				]);
				spyOn(topicsServiceMock, 'default').and.returnValue(new Topic('topicId', 'label', 'description', ['some0']));

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('some0');
			});
		});
	});
});