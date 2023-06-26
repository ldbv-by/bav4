import { LayersPlugin } from '../../src/plugins/LayersPlugin';
import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { $injector } from '../../src/injection';
import { GeoResourceFuture, XyzGeoResource } from '../../src/domain/geoResources';
import { QueryParameters } from '../../src/domain/queryParameters';
import { Topic } from '../../src/domain/topic';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';

describe('LayersPlugin', () => {
	const geoResourceServiceMock = {
		async init() {},
		all() {},
		byId() {},
		asyncById() {},
		addOrReplace() {}
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
		isRetinaDisplay: () => false
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			topics: topicsReducer
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
			const spy = spyOn(instanceUnderTest, '_init').and.returnValue(Promise.resolve(true));

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
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve());

			await instanceUnderTest._init();

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
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'init').and.returnValue(Promise.resolve());
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
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
					new XyzGeoResource('some1', 'someLabel1', 'someUrl1'),
					new XyzGeoResource(configuredBgId, 'someLabel0', 'someUrl0')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', null, configuredBgId));
				const replaceForRetinaDisplaySpy = spyOn(instanceUnderTest, '_replaceForRetinaDisplays').and.callFake((id) => id);

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
				expect(replaceForRetinaDisplaySpy).toHaveBeenCalled();
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
				const replaceForRetinaDisplaySpy = spyOn(instanceUnderTest, '_replaceForRetinaDisplays').and.callFake((id) => id);

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(configuredBgId);
				expect(replaceForRetinaDisplaySpy).toHaveBeenCalled();
			});

			it('adds the first found layer ', () => {
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new XyzGeoResource('someId0', 'someLabel0', 'someUrl0'),
					new XyzGeoResource('someId1', 'someLabel1', 'someUrl1')
				]);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic('topicId', 'label', 'description', null, 'somethingDifferent'));
				const replaceForRetinaDisplaySpy = spyOn(instanceUnderTest, '_replaceForRetinaDisplays').and.callFake((id) => id);

				instanceUnderTest._addLayersFromConfig();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('someId0');
				expect(replaceForRetinaDisplaySpy).toHaveBeenCalled();
			});
		});

		describe('_replaceForRetinaDisplays', () => {
			it('returns the unchanged argument when no retina display', () => {
				setup();
				const topicId = 'topic;';
				setCurrent(topicId);
				const rasterGeoResId = 'rasterGr';
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'isRetinaDisplay').and.returnValue(false);

				const result = instanceUnderTest._replaceForRetinaDisplays(rasterGeoResId);

				expect(result).toBe(rasterGeoResId);
			});

			it('returns the VT pendant for the default raster GeoResource retrieved from the CURRENT topic', () => {
				setup();
				const topicId = 'topic;';
				setCurrent(topicId);
				const rasterGeoResId = 'rasterGr';
				const vectorGeoResId = 'vectorGr';
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'isRetinaDisplay').and.returnValue(true);
				spyOn(topicsServiceMock, 'byId').and.returnValue(
					new Topic(topicId, 'label', 'description', { raster: [rasterGeoResId], vector: [vectorGeoResId] })
				);

				const result = instanceUnderTest._replaceForRetinaDisplays(rasterGeoResId);

				expect(result).toBe(vectorGeoResId);
			});

			it('returns the VT pendant for the default raster GeoResource retrieved from the DEFAULT topic', () => {
				setup();
				const topicId = 'topic;';
				setCurrent(topicId);
				const rasterGeoResId = 'rasterGr';
				const vectorGeoResId = 'vectorGr';
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'isRetinaDisplay').and.returnValue(true);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicId, 'label', 'description'));
				spyOn(topicsServiceMock, 'default').and.returnValue(
					new Topic('default', 'label', 'description', { raster: [rasterGeoResId], vector: [vectorGeoResId] })
				);

				const result = instanceUnderTest._replaceForRetinaDisplays(rasterGeoResId);

				expect(result).toBe(vectorGeoResId);
			});

			it('returns the unchanged argument when the topics baseGeoRs property does not contain expected categories', () => {
				setup();
				const topicId = 'topic;';
				setCurrent(topicId);
				const rasterGeoResId = 'rasterGr';
				const vectorGeoResId = 'vectorGr';
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'isRetinaDisplay').and.returnValue(true);
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicId, 'label', 'description'));
				spyOn(topicsServiceMock, 'default').and.returnValue(
					new Topic('default', 'label', 'description', { foo: [rasterGeoResId], bar: [vectorGeoResId] })
				);

				const result = instanceUnderTest._replaceForRetinaDisplays(rasterGeoResId);

				expect(result).toBe(rasterGeoResId);
			});
		});

		describe('_addLayersFromQueryParams', () => {
			it('adds layers loading existing and on-demand geoResources', () => {
				const queryParam = new URLSearchParams(QueryParameters.LAYER + '=some0,some1,some2');
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some2':
							return new XyzGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});
				spyOn(geoResourceServiceMock, 'asyncById').and.callFake((id) => {
					switch (id) {
						case 'some1':
							return new GeoResourceFuture(id, () => {});
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(3);
				expect(store.getState().layers.active[0].id).toContain('some0_');
				expect(store.getState().layers.active[1].id).toContain('some1_');
				expect(store.getState().layers.active[2].id).toContain('some2_');
			});

			it('adds layers for existing geoResources considering visibility', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_VISIBILITY}=true,false`);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new XyzGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toContain('some0_');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toContain('some1_');
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
							return new XyzGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toContain('some0_');
				expect(store.getState().layers.active[0].visible).toBeTrue();
				expect(store.getState().layers.active[1].id).toContain('some1_');
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
							return new XyzGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toContain('some0_');
				expect(store.getState().layers.active[0].opacity).toBe(0.8);
				expect(store.getState().layers.active[1].id).toContain('some1_');
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
							return new XyzGeoResource('some0', 'someLabel0', 'someUrl0');
						case 'some1':
							return new XyzGeoResource('some1', 'someLabel1', 'someUrl1');
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toContain('some0_');
				expect(store.getState().layers.active[0].opacity).toBe(1);
				expect(store.getState().layers.active[1].id).toContain('some1_');
				expect(store.getState().layers.active[1].opacity).toBe(1);
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
		});
	});
});
