import { LayersPlugin } from '../../src/plugins/LayersPlugin';
import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { $injector } from '../../src/injection';
import { GeoResourceFuture, XyzGeoResource } from '../../src/domain/geoResources';
import { QueryParameters } from '../../src/domain/queryParameters';
import { Topic } from '../../src/domain/topic';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { wcAttributeReducer } from '../../src/store/wcAttribute/wcAttribute.reducer';
import { indicateAttributeChange } from '../../src/store/wcAttribute/wcAttribute.action';
import { initialState as initialPositionState, positionReducer } from '../../src/store/position/position.reducer.js';

describe('LayersPlugin', () => {
	const geoResourceServiceMock = {
		async init() {},
		all() {},
		byId() {},
		asyncById() {},
		addOrReplace() {},
		parseId: (id) => id
	};
	const topicsServiceMock = {
		default() {},
		byId() {}
	};

	const translationService = {
		register() {},
		translate: (key) => key
	};
	const environmentService = {
		getQueryParams: () => new URLSearchParams(),
		isEmbeddedAsWC: () => false
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			topics: topicsReducer,
			position: positionReducer,
			wcAttribute: wcAttributeReducer
		});
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock)
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('TranslationService', translationService);

		return store;
	};

	describe('register', () => {
		it('calls #_init and awaits its completion', async () => {
			const store = setup();
			const instanceUnderTest = new LayersPlugin();
			const spy = spyOn(instanceUnderTest, '_init').withArgs(store).and.resolveTo(true);

			const result = await instanceUnderTest.register(store);

			expect(result).toBeTrue();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_init', () => {
		it('initializes the GeoResourceService and calls #_addLayersFromConfig', async () => {
			const store = setup();
			const instanceUnderTest = new LayersPlugin();
			const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams');
			const addLayersFromConfigSpy = spyOn(instanceUnderTest, '_addLayersFromConfig');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.resolveTo();

			await instanceUnderTest._init(store);

			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(1);
			expect(addLayersFromQueryParamsSpy).not.toHaveBeenCalled();
			expect(addLayersFromConfigSpy).toHaveBeenCalledTimes(1);
			expect(store.getState().layers.ready).toBeTrue();
		});

		it('initializes the GeoResourceService and calls #_addLayersFromQueryParams', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(QueryParameters.LAYER + '=some');
			const instanceUnderTest = new LayersPlugin();
			const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams');
			const addLayersFromConfigSpy = spyOn(instanceUnderTest, '_addLayersFromConfig');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.resolveTo();
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
			await instanceUnderTest._init(store);

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
					new XyzGeoResource('some1', 'someLabel1', 'someUrl1'),
					new XyzGeoResource(configuredBgId, 'someLabel0', 'someUrl0')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', null, configuredBgId));

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
					new XyzGeoResource('some1', 'someLabel1', 'someUrl1'),
					new XyzGeoResource(configuredBgId, 'someLabel0', 'someUrl0')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(null);
				spyOn(topicsServiceMock, 'default').and.returnValue(new Topic('topicId', 'label', 'description', null, configuredBgId));

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
			});

			it('adds the first found layer ', () => {
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new XyzGeoResource('someId0', 'someLabel0', 'someUrl0'),
					new XyzGeoResource('someId1', 'someLabel1', 'someUrl1')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', null, 'somethingDifferent'));

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('someId0');
			});
		});

		describe('_addLayersFromQueryParams', () => {
			it('adds layers loading existing and on-demand geoResources', () => {
				const queryParam = new URLSearchParams(QueryParameters.LAYER + '=some0,some1,some2,some0');
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
						case 'some2':
							return new XyzGeoResource(id, 'someLabel2', 'someUrl2');
					}
				});
				spyOn(geoResourceServiceMock, 'asyncById').and.callFake((id) => {
					switch (id) {
						case 'some1':
							return new GeoResourceFuture(id, () => {});
					}
				});

				const parseIdSpy = spyOn(geoResourceServiceMock, 'parseId').and.callThrough();

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(4);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[2].id).toBe('some2_0');
				expect(store.getState().layers.active[3].id).toBe('some0_1');
				expect(parseIdSpy).toHaveBeenCalled();
			});

			it('restores existing hidden layers', () => {
				const hiddenLayer = { id: 'hiddenLayer0', constraints: { hidden: true } };
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=true,false`);
				const store = setup({
					layers: {
						active: [hiddenLayer]
					}
				});
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(3);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].visible).toBeFalse();
				expect(store.getState().layers.active[2].id).toBe(hiddenLayer.id);
			});

			it('adds layers for existing geoResources considering visibility', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=true,false`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].visible).toBeFalse();
			});

			it('adds layers considering unusable visibility params', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=some,thing`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].visible).toBeTrue();
			});

			it('adds layers considering opacity', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=0.8,.6`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].opacity).toBe(0.8);
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].opacity).toBe(0.6);
			});

			it('adds layers considering unusable opacity params', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=some,thing`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].opacity).toBe(1);
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].opacity).toBe(1);
			});

			it('adds layers considering timestamp', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_TIMESTAMP}=2000,2024`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0').setTimestamps(['2000', '2024']);
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1').setTimestamps(['2000', '2024']);
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].timestamp).toBe('2000');
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].timestamp).toBe('2024');
			});

			it('adds layers considering unusable timestamp params', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_OPACITY}=,1900`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0').setTimestamps(['2000', '2024']);
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1').setTimestamps(['2000', '2024']);
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].timestamp).toBeNull();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].timestamp).toBeNull();
			});

			it('does NOT add a layer when geoResourceService cannot fulfill', () => {
				const queryParam = new URLSearchParams(QueryParameters.LAYER + '=unknown');
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'all').and.returnValue(null);

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(0);
			});

			it('does NOT add a layer when id is not present', () => {
				const queryParam = new URLSearchParams(QueryParameters.LAYER + '=');
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(0);
			});

			describe('handle query parameter ZOOM_TO_EXTENT', () => {
				it('calls action fitLayer() for the correct layer', async () => {
					const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.ZOOM_TO_EXTENT}=1`);
					const store = setup({
						position: initialPositionState
					});
					const instanceUnderTest = new LayersPlugin();
					spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
					spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
						switch (id) {
							case 'some0':
								return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
							case 'some1':
								return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
						}
					});

					expect(store.getState().position.fitLayerRequest.payload).toBeNull();

					instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

					await TestUtils.timeout();

					expect(store.getState().position.fitLayerRequest.payload.id).toBe('some1_0');
				});

				it('does nothing when parameter value is not an integer', async () => {
					const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.ZOOM_TO_EXTENT}=foo`);
					const store = setup({
						position: initialPositionState
					});
					const instanceUnderTest = new LayersPlugin();
					spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
					spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
						switch (id) {
							case 'some0':
								return new XyzGeoResource(id, 'someLabel0', 'someUrl0');
							case 'some1':
								return new XyzGeoResource(id, 'someLabel1', 'someUrl1');
						}
					});

					expect(store.getState().position.fitLayerRequest.payload).toBeNull();

					instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

					await TestUtils.timeout();

					expect(store.getState().position.fitLayerRequest.payload).toBeNull();
				});
			});
		});

		describe('attribute change of the public web component', () => {
			it('initializes the GeoResourceService and calls #_addLayersFromQueryParams', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(QueryParameters.LAYER + '=some');
				const instanceUnderTest = new LayersPlugin();
				const getQueryParamsSpy = spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				const addLayersFromQueryParamsSpy = spyOn(instanceUnderTest, '_addLayersFromQueryParams').withArgs(queryParam).and.stub();
				spyOn(geoResourceServiceMock, 'init').and.resolveTo();
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
				await instanceUnderTest._init(store);
				expect(addLayersFromQueryParamsSpy).toHaveBeenCalledTimes(1);
				expect(getQueryParamsSpy).toHaveBeenCalledTimes(1);

				indicateAttributeChange();

				expect(addLayersFromQueryParamsSpy).toHaveBeenCalledTimes(2);
				expect(getQueryParamsSpy).toHaveBeenCalledTimes(2);
			});
		});
	});
});
