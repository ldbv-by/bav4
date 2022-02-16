import { LayersPlugin } from '../../src/plugins/LayersPlugin';
import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { $injector } from '../../src/injection';
import { GeoResourceFuture, WMTSGeoResource } from '../../src/services/domain/geoResources';
import { QueryParameters } from '../../src/services/domain/queryParameters';
import { Topic } from '../../src/services/domain/topic';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { provide } from '../../src/plugins/i18n/layersPlugin.provider';


describe('LayersPlugin', () => {

	const geoResourceServiceMock = {
		async init() { },
		all() { },
		byId() { },
		asyncById() { },
		addOrReplace() { }
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
	const translationService = {
		register() { },
		translate: (key) => key
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			topics: topicsReducer
		});
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock)
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
			.registerSingleton('TranslationService', translationService);

		return store;
	};

	describe('constructor', () => {

		it('registers an i18n provider', async () => {
			const translationServiceSpy = spyOn(translationService, 'register');
			setup();

			new LayersPlugin();

			expect(translationServiceSpy).toHaveBeenCalledWith('layersPluginProvider', provide);
		});
	});

	describe('register', () => {

		it('calls #_init and awaits its completion', async () => {
			const store = setup();
			const instanceUnderTest = new LayersPlugin();
			const spy = spyOn(instanceUnderTest, '_init').and.returnValue(Promise.resolve(true));

			const result = await instanceUnderTest.register(store);

			expect(result).toBeTrue();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_init', () => {

		it('initializes the georesource service and calls #_addLayersFromConfig', async () => {
			const store = setup();
			const instanceUnderTest = new LayersPlugin();
			const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams');
			const addLayersFromConfigSpy = spyOn(instanceUnderTest, '_addLayersFromConfig');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve());

			await instanceUnderTest._init();

			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(1);
			expect(addLayersFromQueryParamsSpy).not.toHaveBeenCalled();
			expect(addLayersFromConfigSpy).toHaveBeenCalledTimes(1);
			expect(store.getState().layers.ready).toBeTrue();
		});

		it('initializes the georesource service and calls #_addLayersFromQueryParams', async () => {
			const store = setup();
			const queryParam = QueryParameters.LAYER + '=some';
			const instanceUnderTest = new LayersPlugin();
			const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams');
			const addLayersFromConfigSpy = spyOn(instanceUnderTest, '_addLayersFromConfig');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve());
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest._init();

			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(addLayersFromQueryParamsSpy).toHaveBeenCalledOnceWith(new URLSearchParams(queryParam));
			expect(addLayersFromConfigSpy).not.toHaveBeenCalled();
			expect(store.getState().layers.ready).toBeTrue();
		});

		describe('_addLayersFromConfig', () => {

			it('adds the configured layer', () => {
				const store = setup();
				const configuredBgId = 'atkis';
				setCurrent(configuredBgId);
				const instanceUnderTest = new LayersPlugin();

				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some1', 'someLabel1', 'someUrl1'),
					new WMTSGeoResource(configuredBgId, 'someLabel0', 'someUrl0')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', [configuredBgId]));


				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('adds the configured layer from default topic', () => {
				const store = setup();
				const configuredBgId = 'atkis';
				setCurrent(configuredBgId);
				const instanceUnderTest = new LayersPlugin();

				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some1', 'someLabel1', 'someUrl1'),
					new WMTSGeoResource(configuredBgId, 'someLabel0', 'someUrl0')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(null);
				spyOn(topicsServiceMock, 'default').and.returnValue(new Topic('topicId', 'label', 'description', [configuredBgId]));

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('adds the first found layer ', () => {
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
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

			it('adds layers loading existing and on-demand geoResources', () => {
				const queryParam = QueryParameters.LAYER + '=some0,some1,some2';
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new WMTSGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some2':
							return new WMTSGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});
				spyOn(geoResourceServiceMock, 'asyncById').and.callFake((id) => {
					switch (id) {
						case 'some1':
							return new GeoResourceFuture(id, () => { });
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(3);
				expect(store.getState().layers.active[0].id).toBe('some0');
				expect(store.getState().layers.active[1].id).toBe('some1');
				expect(store.getState().layers.active[2].id).toBe('some2');
			});

			it('adds layers for existing geoResources considering visibility', () => {
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=true,false`;
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
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

			it('adds layers considering unuseable visibility params', () => {
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=some,thing`;
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
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

			it('adds layers considering opacity', () => {
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=0.8,.6`;
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
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

			it('adds layers considering unuseable opacity params', () => {
				const queryParam = `${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=some,thing`;
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
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

			it('does NOT add a layer when geoResourceService cannot fullfill', () => {
				const queryParam = QueryParameters.LAYER + '=unknown';
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'all').and.returnValue(null);

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(0);
			});

			it('does NOT add a layer when id is not present', () => {
				const queryParam = QueryParameters.LAYER + '=';
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(0);
			});

			it('updates the layers label for on-demand geoResources', async () => {
				const queryParam = `${QueryParameters.LAYER}=some0`;
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				const id = 'id';
				const labelBefore = 'labelBefore';
				const labelAfter = 'labelAfter';
				const geoResource0 = new WMTSGeoResource(id, labelAfter, 'someUrl0');
				const future0 = new GeoResourceFuture('some0', async () => geoResource0);
				future0.setLabel(labelBefore);
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'asyncById').and.returnValue(future0);

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active[0].label).toBe(labelBefore);
				//Let's resolve the future
				await future0.get();
				expect(store.getState().layers.active[0].label).toBe(labelAfter);
			});
		});
	});
});
