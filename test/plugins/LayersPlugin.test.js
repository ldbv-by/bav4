import { LayersPlugin } from '../../src/plugins/LayersPlugin';
import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { $injector } from '../../src/injection';
import { GeoResourceTypes, VectorGeoResource, VectorSourceType, WMTSGeoResource } from '../../src/services/domain/geoResources';
import { QueryParameters } from '../../src/services/domain/queryParameters';
import { Topic } from '../../src/services/domain/topic';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { FileStorageServiceDataTypes } from '../../src/services/FileStorageService';
import { addLayer } from '../../src/store/layers/layers.action';
import { provide } from '../../src/plugins/i18n/layersPlugin.provider';


describe('LayersPlugin', () => {

	const geoResourceServiceMock = {
		async init() { },
		all() { },
		byId() { },
		addOrReplace() { }
	};
	const topicsServiceMock = {
		default() { },
		byId() { }
	};
	const fileStorageServiceMock = {
		get() { },
		getFileId() { },
		isFileId() { },
		isAdminId() { }
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
			.registerSingleton('FileStorageService', fileStorageServiceMock)
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

			it('adds layer', () => {
				const queryParam = QueryParameters.LAYER + '=some0,some1';
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				const registerUnkownGeoResourceSpy = spyOn(instanceUnderTest, '_registerUnkownGeoResource').and.callThrough();
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
				expect(registerUnkownGeoResourceSpy).toHaveBeenCalledTimes(2);
			});

			it('adds layer considering visibility', () => {
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

			it('adds layer considering unuseable visibility params', () => {
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

			it('adds layer considering opacity', () => {
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

			it('adds layer considering unuseable opacity params', () => {
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


			it('adds layer by calling #_addLayersFromConfig as fallback', () => {
				const queryParam = QueryParameters.LAYER + '=unknown';
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'all').and.returnValue([
					new WMTSGeoResource('some0', 'someLabel0', 'someUrl0')
				]);
				spyOn(topicsServiceMock, 'default').and.returnValue(new Topic('topicId', 'label', 'description', ['some0']));

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('some0');
			});
		});

		describe('_registerUnkownGeoResource', () => {

			it('registers unknown geoResources', () => {
				let registeredGeoResource = null;
				const id = 'unknownId';
				setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(instanceUnderTest, '_newVectorGeoResourceLoader').and.returnValue({});
				const newLabelUpdateHandlerSpy = spyOn(instanceUnderTest, '_newLabelUpdateHandler').and.returnValue({});
				const addOrReplaceSpy = spyOn(geoResourceServiceMock, 'addOrReplace').and.callFake(geoResource => {
					registeredGeoResource = geoResource;
				});
				const byIdSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(null);

				const value = instanceUnderTest._registerUnkownGeoResource(id);

				expect(registeredGeoResource.id).toBe(id);
				expect(registeredGeoResource.getType()).toEqual(GeoResourceTypes.VECTOR);
				expect(registeredGeoResource.sourceType).toBeNull();
				expect(registeredGeoResource._loader).not.toBeNull();
				expect(registeredGeoResource.label).toBe('layersPlugin_store_layer_default_layer_name');
				expect(newLabelUpdateHandlerSpy).toHaveBeenCalledWith(id);
				expect(byIdSpy).toHaveBeenCalledTimes(1);
				expect(addOrReplaceSpy).toHaveBeenCalledTimes(1);
				expect(value).toBe(id);
			});

			it('does nothing when geoResource is well known', () => {
				const id = 'unknownId';
				setup();
				const instanceUnderTest = new LayersPlugin();
				const newVectorGeoResourceLoaderSpy = spyOn(instanceUnderTest, '_newVectorGeoResourceLoader').and.returnValue({});
				const newLabelUpdateHandlerSpy = spyOn(instanceUnderTest, '_newLabelUpdateHandler').and.returnValue({});
				const addOrReplaceSpy = spyOn(geoResourceServiceMock, 'addOrReplace');
				const byIdSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(new WMTSGeoResource('some0', 'someLabel0', 'someUrl0'));

				const value = instanceUnderTest._registerUnkownGeoResource('unknownId');

				expect(newVectorGeoResourceLoaderSpy).not.toHaveBeenCalled();
				expect(newLabelUpdateHandlerSpy).not.toHaveBeenCalled();
				expect(addOrReplaceSpy).not.toHaveBeenCalled();
				expect(byIdSpy).toHaveBeenCalledTimes(1);
				expect(value).toBe(id);
			});
		});

		describe('_newVectorGeoResourceLoader', () => {

			it('returns a loader for KML VectorGeoResources', async () => {
				const id = 'id';
				const fileId = 'f_id';
				const data = 'data';
				const type = FileStorageServiceDataTypes.KML;
				const srid = 1234;
				setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(instanceUnderTest, '_getFileId').withArgs(id).and.returnValue(fileId);
				spyOn(fileStorageServiceMock, 'get').withArgs(fileId).and.returnValue(
					Promise.resolve({ data: data, type: type, srid: srid })
				);


				const loader = instanceUnderTest._newVectorGeoResourceLoader(id);
				expect(typeof loader === 'function').toBeTrue();


				const result = await loader();
				expect(result.data).toBe(data);
				expect(result.sourceType).toBe(VectorSourceType.KML);
				expect(result.srid).toBe(srid);
			});

			it('throws an error when source type is not supported', async () => {
				const id = 'id';
				const fileId = 'f_id';
				const data = 'data';
				const type = 'unsupported';
				const srid = 1234;
				setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(instanceUnderTest, '_getFileId').withArgs(id).and.returnValue(fileId);
				spyOn(fileStorageServiceMock, 'get').withArgs(fileId).and.returnValue(
					Promise.resolve({ data: data, type: type, srid: srid })
				);


				const loader = instanceUnderTest._newVectorGeoResourceLoader(id);
				expect(typeof loader === 'function').toBeTrue();

				try {
					await loader();
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toBe('No VectorGeoResourceLoader available for ' + type);
				}
			});
		});

		describe('_newLabelUpdateHandler', () => {

			it('returns a proxy handler which updates the label property of a layer', async () => {
				const id = 'id';
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				const layer0 = { label: 'label0' };
				addLayer(id, layer0);

				const handler = instanceUnderTest._newLabelUpdateHandler(id);
				const vgr = new VectorGeoResource(id, 'new Layer', null);
				const proxifiedVgr = new Proxy(vgr, handler);
				proxifiedVgr.label = 'updatedLabel';

				expect(store.getState().layers.active[0].label).toBe('updatedLabel');
			});
		});

		describe('_getFileId', () => {

			it('returns the fileId for an adminId', async () => {
				const adminId = 'a_id';
				const fileId = 'f_id';
				setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(fileStorageServiceMock, 'isAdminId').withArgs(adminId).and.returnValue(true);
				spyOn(fileStorageServiceMock, 'getFileId').withArgs(adminId).and.returnValue(
					Promise.resolve(fileId)
				);

				const result = await instanceUnderTest._getFileId(adminId);

				expect(result).toBe(fileId);
			});

			it('returns the fileId', async () => {
				const fileId = 'f_id';
				setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(fileStorageServiceMock, 'isAdminId').withArgs(fileId).and.returnValue(false);
				spyOn(fileStorageServiceMock, 'isFileId').withArgs(fileId).and.returnValue(true);

				const result = await instanceUnderTest._getFileId(fileId);

				expect(result).toBe(fileId);
			});

			it('throws an error when a fileId could not be determined', async () => {
				const id = 'foo';
				setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(fileStorageServiceMock, 'isAdminId').withArgs(id).and.returnValue(false);
				spyOn(fileStorageServiceMock, 'isFileId').withArgs(id).and.returnValue(false);

				try {
					await instanceUnderTest._getFileId(id);
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toBe(`${id} is not a valid fileId or adminId`);
				}
			});
		});
	});
});
