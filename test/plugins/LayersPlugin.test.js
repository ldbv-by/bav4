import { LayersPlugin } from '../../src/plugins/LayersPlugin';
import { TestUtils } from '../test-utils.js';
import { createDefaultLayer, createDefaultLayersConstraints, layersReducer } from '../../src/store/layers/layers.reducer';
import { $injector } from '../../src/injection';
import { GeoResourceFuture, OafGeoResource, XyzGeoResource } from '../../src/domain/geoResources';
import { QueryParameters } from '../../src/domain/queryParameters';
import { Topic } from '../../src/domain/topic';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { initialState as initialPositionState, positionReducer } from '../../src/store/position/position.reducer.js';
import {
	closeLayerFilterUI,
	closeLayerSettingsUI,
	openLayerFilterUI,
	openLayerSettingsUI,
	removeLayer,
	SwipeAlignment
} from '../../src/store/layers/layers.action.js';
import { bottomSheetReducer, LAYER_FILTER_BOTTOM_SHEET_ID, LAYER_SETTINGS_BOTTOM_SHEET_ID } from '../../src/store/bottomSheet/bottomSheet.reducer.js';
import { closeBottomSheet } from '../../src/store/bottomSheet/bottomSheet.action.js';
import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '../../src/domain/layer.js';

describe('LayersPlugin', () => {
	const geoResourceServiceMock = {
		async init() {},
		all() {},
		byId() {},
		asyncById() {},
		addOrReplace: (gr) => gr
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
			topics: topicsReducer,
			position: positionReducer,
			bottomSheet: bottomSheetReducer
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

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(4);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[2].id).toBe('some2_0');
				expect(store.getState().layers.active[3].id).toBe('some0_1');
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
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_TIMESTAMP}=,1900`);
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

			it('adds layers considering swipeAlignments', () => {
				const queryParam = new URLSearchParams(
					`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_SWIPE_ALIGNMENT}=${SwipeAlignment.RIGHT},${SwipeAlignment.LEFT}`
				);
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
				expect(store.getState().layers.active[0].constraints).toEqual({ ...createDefaultLayersConstraints(), swipeAlignment: SwipeAlignment.RIGHT });
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].constraints).toEqual({ ...createDefaultLayersConstraints(), swipeAlignment: SwipeAlignment.LEFT });
			});

			it('adds layers considering unusable swipeAlignment params', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_SWIPE_ALIGNMENT}=,foo`);
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
				expect(store.getState().layers.active[0].constraints).toEqual(createDefaultLayersConstraints());
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].constraints).toEqual(createDefaultLayersConstraints());
			});

			it('adds layers considering style params', async () => {
				const queryParam = new URLSearchParams(
					`${QueryParameters.LAYER}=some0,some1,some2,some3,some4&${QueryParameters.LAYER_STYLE}=notAHexColor,fcba03,3d2323,34deeb,34deeb`
				);
				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				const geoResFuture0 = new GeoResourceFuture(
					'some3',
					async () => new OafGeoResource('some3', 'someLabel3', 'someUrl3', 'someCollectionId3', 3857)
				);
				const geoResFuture1 = new GeoResourceFuture(
					'some4',
					async () =>
						// XyzGeoResource does not inherit from AbstractVectorGeoResource
						new XyzGeoResource('some4', 'someLabel4', 'someUrl4', 'someCollectionId4', 3857)
				);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new OafGeoResource(id, 'someLabel0', 'someUrl0', 'someCollectionId0', 3857);
						case 'some1':
							return new OafGeoResource(id, 'someLabel1', 'someUrl1', 'someCollectionId1', 3857);
						case 'some2':
							// XyzGeoResource does not inherit from AbstractVectorGeoResource
							return new XyzGeoResource(id, 'someLabel0', 'someUrl0', 'someCollectionId0', 3857);
						case geoResFuture0.id:
							return geoResFuture0;
						case geoResFuture1.id:
							return geoResFuture1;
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				// we let the GeoResourceFuture resolve
				await Promise.all([geoResFuture0.get(), geoResFuture1.get()]);
				expect(store.getState().layers.active.length).toBe(5);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].style).toBeNull();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].style).toEqual({ baseColor: '#fcba03' });
				expect(store.getState().layers.active[2].id).toBe('some2_0');
				expect(store.getState().layers.active[2].style).toBeNull();
				expect(store.getState().layers.active[3].id).toBe('some3_0');
				expect(store.getState().layers.active[3].style).toEqual({ baseColor: '#34deeb' });
				expect(store.getState().layers.active[4].id).toBe('some4_0');
				expect(store.getState().layers.active[4].style).toBeNull();
			});

			it('adds layers considering unusable style params', () => {
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_STYLE}=,foo`);
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
				expect(store.getState().layers.active[0].style).toBeNull();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[0].style).toBeNull();
			});

			it('adds layers considering filter params', () => {
				const queryParam = new URLSearchParams(
					`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_FILTER}=,${encodeURIComponent("(((name LIKE '%Baggerloch%')))")}`
				);

				const store = setup();
				const instanceUnderTest = new LayersPlugin();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					switch (id) {
						case 'some0':
							return new OafGeoResource(id, 'someLabel0', 'someUrl0', 'someCollectionId0', 3857);
						case 'some1':
							return new XyzGeoResource(id, 'someLabel1', 'someUrl1', 'someCollectionId1', 3857);
					}
				});

				instanceUnderTest._addLayersFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('some0_0');
				expect(store.getState().layers.active[0].constraints.filter).toBeNull();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].constraints.filter).toBe("(((name LIKE '%Baggerloch%')))");
			});

			it('adds layers considering update interval', () => {
				const queryParam = new URLSearchParams(
					`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_UPDATE_INTERVAL}=100.62,${DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS}`
				);
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
				expect(store.getState().layers.active[0].constraints.updateInterval).toBe(100);
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].constraints.updateInterval).toBe(60);
			});

			it('adds layers considering unusable update interval params', () => {
				const queryParam = new URLSearchParams(
					`${QueryParameters.LAYER}=some0,some1&${QueryParameters.LAYER_UPDATE_INTERVAL}=notANumber,${DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS - 1}`
				);
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
				expect(store.getState().layers.active[0].constraints.updateInterval).toBeNull();
				expect(store.getState().layers.active[1].id).toBe('some1_0');
				expect(store.getState().layers.active[1].constraints.updateInterval).toBeNull();
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
	});

	describe('UI handling', () => {
		const setupTestInstance = async (instanceUnderTest, store) => {
			const queryParam = new URLSearchParams();
			spyOn(instanceUnderTest, '_addLayersFromQueryParams').withArgs(queryParam).and.stub();
			spyOn(instanceUnderTest, '_addLayersFromConfig').and.stub();
			spyOn(geoResourceServiceMock, 'init').and.resolveTo();
			return instanceUnderTest._init(store);
		};

		describe('Layer filter', () => {
			describe('when property `activeFilterUI` of slice-of-state `layers` changes', () => {
				it('opens/closes the BottomSheet component', async () => {
					const store = setup();
					const layerId = 'layerId0';
					const instanceUnderTest = new LayersPlugin();
					const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetFilterUiUnsubscribeFn');
					await setupTestInstance(instanceUnderTest, store);

					openLayerFilterUI(layerId);

					const expectedTag = 'ba-oaf-mask';
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data[0].content);
					expect(wrapperElement.querySelectorAll(expectedTag)).toHaveSize(1);
					expect(wrapperElement.querySelector(expectedTag).layerId).toBe(layerId);
					expect(store.getState().bottomSheet.active).toEqual([LAYER_FILTER_BOTTOM_SHEET_ID]);
					expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();

					closeLayerFilterUI();

					expect(store.getState().bottomSheet.active).toHaveSize(0);
				});
			});

			describe('when property `active` of slice-of-state `bottomSheet` changes', () => {
				it('closes the Filter-UI component when BottomSheet was closed', async () => {
					const layerId = 'layerId0';
					const store = setup();
					const instanceUnderTest = new LayersPlugin();
					await setupTestInstance(instanceUnderTest, store);
					openLayerFilterUI(layerId);

					closeBottomSheet(LAYER_FILTER_BOTTOM_SHEET_ID);

					expect(store.getState().layers.activeFilterUI).toBeNull();
				});
			});
		});

		describe('Settings filter', () => {
			describe('when property `activeSettingsUI` of slice-of-state `layers` changes', () => {
				it('opens/closes the BottomSheet component', async () => {
					const store = setup();
					const layerId = 'layerId0';
					const instanceUnderTest = new LayersPlugin();
					const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetSettingsUiUnsubscribeFn');
					await setupTestInstance(instanceUnderTest, store);

					openLayerSettingsUI(layerId);

					const expectedTag = 'ba-layer-settings';
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data[0].content);
					expect(wrapperElement.querySelectorAll(expectedTag)).toHaveSize(1);
					expect(wrapperElement.querySelector(expectedTag).layerId).toBe(layerId);
					expect(store.getState().bottomSheet.active).toEqual([LAYER_SETTINGS_BOTTOM_SHEET_ID]);
					expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();

					closeLayerSettingsUI();

					expect(store.getState().bottomSheet.active).toHaveSize(0);
				});
			});

			describe('when property `active` of slice-of-state `bottomSheet` changes', () => {
				it('closes the Settings-UI component when BottomSheet was closed', async () => {
					const layerId = 'layerId0';
					const store = setup();
					const instanceUnderTest = new LayersPlugin();
					await setupTestInstance(instanceUnderTest, store);
					openLayerSettingsUI(layerId);

					closeBottomSheet(LAYER_SETTINGS_BOTTOM_SHEET_ID);

					expect(store.getState().layers.activeSettingsUI).toBeNull();
				});
			});
		});

		describe('Layer is removed', () => {
			it('closes the corresponding UI', async () => {
				const layerId0 = 'layer0';
				const layerId1 = 'layer1';
				const layerId2 = 'layer2';

				const store = setup({
					layers: {
						active: [createDefaultLayer(layerId0), createDefaultLayer(layerId1), createDefaultLayer(layerId2)],
						activeFilterUI: layerId1,
						activeSettingsUI: layerId2
					}
				});
				const instanceUnderTest = new LayersPlugin();
				await setupTestInstance(instanceUnderTest, store);

				removeLayer(layerId0);

				expect(store.getState().layers.activeFilterUI).not.toBeNull();
				expect(store.getState().layers.activeSettingsUI).not.toBeNull();

				removeLayer(layerId1);

				expect(store.getState().layers.activeFilterUI).toBeNull();
				expect(store.getState().layers.activeSettingsUI).not.toBeNull();

				removeLayer(layerId2);

				expect(store.getState().layers.activeFilterUI).toBeNull();
				expect(store.getState().layers.activeSettingsUI).toBeNull();
			});
		});
	});
});
