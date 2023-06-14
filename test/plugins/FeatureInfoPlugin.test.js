import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { setClick } from '../../src/store/pointer/pointer.action';
import { TabIds } from '../../src/domain/mainMenu';
import { addFeatureInfoItems } from '../../src/store/featureInfo/featureInfo.action.js';
import { FeatureInfoPlugin } from '../../src/plugins/FeatureInfoPlugin.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer.js';
import { $injector } from '../../src/injection/index.js';
import { createDefaultLayer, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { positionReducer } from '../../src/store/position/position.reducer.js';
import { FeatureInfoResult } from '../../src/services/FeatureInfoService.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '../../src/store/notifications/notifications.action.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';

describe('FeatureInfoPlugin', () => {
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
			tools: toolsReducer
		});
		$injector
			.registerSingleton('FeatureInfoService', featureInfoService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('TranslationService', translationService);
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

			expect(store.getState().featureInfo.current).toHaveSize(0);
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
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [createDefaultLayer(layerId0, geoResourceId0)]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(geoResourceId0, coordinate, resolution).and.resolveTo(new FeatureInfoResult('content', 'title'));
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.querying).toBeTrue();
				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveSize(1);
				expect(store.getState().featureInfo.current[0].content).toBe('content');
				expect(store.getState().featureInfo.current[0].title).toBe('title');
				expect(store.getState().featureInfo.querying).toBeFalse();
			});

			it("adds FeatureInfo items taking the GeoResource' label as title", async () => {
				const labelO = 'label0';
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResourceId0';
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId0).and.returnValue({ label: labelO } /*fake GeoResource */);
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0, geoResourceId0) }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(geoResourceId0, coordinate, resolution).and.resolveTo(new FeatureInfoResult('content'));
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveSize(1);
				expect(store.getState().featureInfo.current[0].content).toBe('content');
				expect(store.getState().featureInfo.current[0].title).toBe(labelO);
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

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				const featureInfoServiceSpy = spyOn(featureInfoService, 'get');
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(featureInfoServiceSpy).not.toHaveBeenCalled();
			});

			it('adds NO FeatureInfo items when service returns NO result', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResource0';
				const label0 = 'label0';
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId0).and.returnValue({ label: label0 } /*fake GeoResource */);
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0, geoResourceId0) }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(geoResourceId0, coordinate, resolution).and.resolveTo(null);
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.querying).toBeTrue();
				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveSize(0);
				expect(store.getState().featureInfo.querying).toBeFalse();
			});

			it('emits a notification and logs a warning when service throws exception', async () => {
				const layerId0 = 'id0';
				const geoResourceId0 = 'geoResource0';
				const label0 = 'label0';
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId0).and.returnValue({ label: label0 } /*fake GeoResource */);
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const errorMessage = 'something got wrong';
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0, geoResourceId0) }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();
				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(geoResourceId0, coordinate, resolution).and.returnValue(Promise.reject(errorMessage));
				const errorSpy = spyOn(console, 'error');
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.querying).toBeTrue();
				await TestUtils.timeout();
				expect(store.getState().featureInfo.current).toHaveSize(0);
				expect(store.getState().notifications.latest.payload.content).toBe(`${label0}: global_featureInfoService_exception`);
				expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
				expect(errorSpy).toHaveBeenCalledWith(errorMessage);
				expect(store.getState().featureInfo.querying).toBeFalse();
			});
		});
	});

	describe('when tools.current property changes', () => {
		describe('when tools.current is a toolId', () => {
			it('resets the FeatureInfo', async () => {
				const store = setup();
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });
				expect(store.getState().featureInfo.current).toHaveSize(1);

				setCurrentTool('foo');

				expect(store.getState().featureInfo.current).toHaveSize(0);
			});
		});

		describe('when tools.current is a nullish', () => {
			it('resets NOT the FeatureInfo on tools.current is null', async () => {
				const store = setup({ tools: { current: 'some' } });
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });

				expect(store.getState().featureInfo.current).toHaveSize(1);

				setCurrentTool(null);

				expect(store.getState().featureInfo.current).toHaveSize(1);
			});
		});
	});
});
