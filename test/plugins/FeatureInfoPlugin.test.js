import { TestUtils } from '@test/test-utils.js';
import { featureInfoReducer } from '@src/store/featureInfo/featureInfo.reducer';
import { setClick } from '@src/store/pointer/pointer.action';
import { TabIds } from '@src/domain/mainMenu';
import { addFeatureInfoItems } from '@src/store/featureInfo/featureInfo.action.js';
import { FeatureInfoPlugin } from '@src/plugins/FeatureInfoPlugin.js';
import { createNoInitialStateMainMenuReducer } from '@src/store/mainMenu/mainMenu.reducer.js';
import { pointerReducer } from '@src/store/pointer/pointer.reducer.js';
import { $injector } from '@src/injection/index.js';
import { createDefaultLayer, layersReducer } from '@src/store/layers/layers.reducer.js';
import { positionReducer } from '@src/store/position/position.reducer.js';
import { notificationReducer } from '@src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '@src/store/notifications/notifications.action.js';
import { setCurrentTool } from '@src/store/tools/tools.action.js';
import { toolsReducer } from '@src/store/tools/tools.reducer.js';
import { networkReducer } from '@src/store/network/network.reducer.js';
import { XyzGeoResource } from '@src/domain/geoResources.js';
import { QueryParameters } from '@src/domain/queryParameters.js';
import { setFetching } from '@src/store/network/network.action.js';

describe('FeatureInfoPlugin', () => {
	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const featureInfoService = {
		async get() {}
	};

	const mapService = {
		calcResolution() {}
	};

	const geoResourceService = {
		byId() {}
	};

	const translationService = {
		register() {},
		translate: (key) => key
	};

	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: true,
				tabIndex: TabIds.MAPS
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			featureInfo: featureInfoReducer,
			pointer: pointerReducer,
			layers: layersReducer,
			position: positionReducer,
			notifications: notificationReducer,
			tools: toolsReducer,
			network: networkReducer
		});
		$injector
			.registerSingleton('FeatureInfoService', featureInfoService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('TranslationService', translationService)
			.registerSingleton('EnvironmentService', environmentService);
		return store;
	};

	describe('when pointer.click property changes', () => {
		it('clears all previous existing FeatureInfo items and updates the coordinate property', async () => {
			const coordinate = [11, 22];
			const store = setup();
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);
			addFeatureInfoItems({ title: 'title', content: 'content' });

			setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

			expect(store.getState().featureInfo.current).toHaveLength(0);
			expect(store.getState().featureInfo.coordinate.payload).toBe(coordinate);
		});

		it('ignores pointer.click changes as long as query is running', async () => {
			const firstCoordinate = [11, 22];
			const secondCoordinate = [55, 66];
			const store = setup();
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);

			setClick({ coordinate: firstCoordinate, screenCoordinate: [33, 44] });
			setClick({ coordinate: [secondCoordinate], screenCoordinate: [77, 88] });

			expect(store.getState().featureInfo.coordinate.payload).toBe(firstCoordinate);
		});

		describe('calls the FeatureInfoService', () => {
			it('adds FeatureInfo items ', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResourceId0';
				const timestamp = '1900';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const geoResourceSpy = vi
					.spyOn(geoResourceService, 'byId')
					.mockReturnValue(new XyzGeoResource(geoResourceId0, 'label', 'url').setTimestamps(['timestamp']));
				const mapServiceSpy = vi.spyOn(mapService, 'calcResolution').mockReturnValue(resolution);
				const featureInfoServiceSpy = vi.spyOn(featureInfoService, 'get').mockResolvedValue({ content: 'content', title: 'title' });

				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0, geoResourceId0), timestamp }]
					},
					position: {
						zoom: zoom
					}
				});

				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				// enforces withArgs
				expect(geoResourceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId0);
				expect(mapServiceSpy).toHaveBeenCalledExactlyOnceWith(zoom, coordinate);
				expect(featureInfoServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId0, coordinate, resolution, timestamp);

				expect(store.getState().featureInfo.querying).toBe(true);
				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveLength(1);
				expect(store.getState().featureInfo.current[0].content).toBe('content');
				expect(store.getState().featureInfo.current[0].title).toBe('title');
				expect(store.getState().featureInfo.querying).toBe(false);
			});

			it('adds NO FeatureInfo items when layer is invisible or hidden', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResourceId0';
				const layerId1 = 'id1';
				const geoResourceId1 = 'geoResourceId1';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [
							{ ...createDefaultLayer(layerId0, geoResourceId0), constraints: { hidden: true } },
							{ ...createDefaultLayer(layerId1, geoResourceId1), visible: false }
						]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				const mapServiceSpy = vi.spyOn(mapService, 'calcResolution').mockReturnValue(resolution);
				const featureInfoServiceSpy = vi.spyOn(featureInfoService, 'get').mockImplementation(async () => {});
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(mapServiceSpy).toHaveBeenCalledExactlyOnceWith(zoom, coordinate);
				expect(featureInfoServiceSpy).not.toHaveBeenCalled();
			});

			it('adds NO FeatureInfo items when service returns NO result', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResource0';
				const label0 = 'label0';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(new XyzGeoResource(geoResourceId0, label0, 'url'));
				const mapServiceSpy = vi.spyOn(mapService, 'calcResolution').mockReturnValue(resolution);
				const featureInfoServiceSpy = vi.spyOn(featureInfoService, 'get').mockResolvedValue(null);
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0, geoResourceId0) }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(geoResourceServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId0);
				expect(mapServiceSpy).toHaveBeenCalledExactlyOnceWith(zoom, coordinate);
				expect(featureInfoServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId0, coordinate, resolution, null);

				expect(store.getState().featureInfo.querying).toBe(true);
				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveLength(0);
				expect(store.getState().featureInfo.querying).toBe(false);
			});

			it('emits a notification and logs a warning when service throws exception', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResource0';
				const label0 = 'label0';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const errorMessage = 'something got wrong';
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(new XyzGeoResource(geoResourceId0, label0, 'url'));
				const mapServiceSpy = vi.spyOn(mapService, 'calcResolution').mockReturnValue(resolution);
				const featureInfoServiceSpy = vi.spyOn(featureInfoService, 'get').mockReturnValue(Promise.reject(errorMessage));
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0, geoResourceId0) }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();
				const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(geoResourceServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId0);
				expect(mapServiceSpy).toHaveBeenCalledExactlyOnceWith(zoom, coordinate);
				expect(featureInfoServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId0, coordinate, resolution, null);
				expect(store.getState().featureInfo.querying).toBe(true);
				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveLength(0);
				expect(store.getState().notifications.latest.payload.content).toBe(`${label0}: global_featureInfoService_exception`);
				expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
				expect(errorSpy).toHaveBeenCalledWith(errorMessage);
				expect(store.getState().featureInfo.querying).toBe(false);
			});
		});
	});

	describe('when tools.current property changes', () => {
		describe('when tools.current is a toolId', () => {
			it('aborts the FeatureInfo query', async () => {
				const store = setup();
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });
				expect(store.getState().featureInfo.aborted).toBeNull();

				setCurrentTool('foo');

				expect(store.getState().featureInfo.aborted).not.toBeNull();
			});
		});

		describe('when tools.current is a nullish', () => {
			it('does NOT abort the FeatureInfo query', async () => {
				const store = setup({ tools: { current: 'some' } });
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });

				expect(store.getState().featureInfo.aborted).toBeNull();

				setCurrentTool(null);

				expect(store.getState().featureInfo.aborted).toBeNull();
			});
		});
	});

	describe("when search query parameter 'FEATURE_INFO_REQUEST' has a value", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		describe("when search query parameter 'FEATURE_INFO_REQUEST' has valid coordinate", () => {
			it('triggers a FeatureInfo request', async () => {
				const coordinate = [42, 21];
				const state = {
					position: { center: coordinate }
				};
				const store = setup(state);
				const queryParam = new URLSearchParams(`${QueryParameters.FEATURE_INFO_REQUEST}=42,21`);
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);

				// we simulate some network traffic
				setFetching(true);
				setFetching(false);
				setFetching(true);

				expect(store.getState().featureInfo.querying).toBe(false);
				vi.advanceTimersByTime(FeatureInfoPlugin.FEATURE_INFO_DELAY_MS + 100);
				expect(store.getState().featureInfo.querying).toBe(true);
			});

			describe('coordinates is not valid', () => {
				it('does NOT trigger a FeatureInfo request', async () => {
					const coordinate = [42, 21];
					const state = {
						position: { center: coordinate }
					};
					const store = setup(state);
					const queryParam = new URLSearchParams(`${QueryParameters.FEATURE_INFO_REQUEST}=42,invalid`);
					vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
					const instanceUnderTest = new FeatureInfoPlugin();
					await instanceUnderTest.register(store);

					// we simulate some network traffic
					setFetching(true);
					setFetching(false);
					setFetching(true);

					vi.advanceTimersByTime(FeatureInfoPlugin.FEATURE_INFO_DELAY_MS + 100);

					expect(store.getState().featureInfo.querying).toBe(false);
				});
			});
		});
	});
});
