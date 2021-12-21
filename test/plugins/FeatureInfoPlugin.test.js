import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { setClick } from '../../src/store/pointer/pointer.action';
import { TabKey } from '../../src/store/mainMenu/mainMenu.action';
import { addFeatureInfoItems } from '../../src/store/featureInfo/featureInfo.action.js';
import { FeatureInfoPlugin } from '../../src/plugins/FeatureInfoPlugin.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer.js';
import { $injector } from '../../src/injection/index.js';
import { createDefaultLayer, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { positionReducer } from '../../src/store/position/position.reducer.js';
import { FeatureInfoResult } from '../../src/services/FeatureInfoService.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { provide } from '../../src/plugins/i18n/featureInfoPlugin.provider.js';
import { LevelTypes } from '../../src/store/notifications/notifications.action.js';


describe('FeatureInfoPlugin', () => {

	const featureInfoService = {
		async get() { }
	};

	const mapService = {
		calcResolution() { }
	};

	const translationService = {
		register() { },
		translate: (key) => key
	};

	const setup = (state) => {

		const initialState = {
			mainMenu: {
				open: true,
				tabIndex: TabKey.MAPS
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			featureInfo: featureInfoReducer,
			pointer: pointerReducer,
			layers: layersReducer,
			position: positionReducer,
			notifications: notificationReducer
		});
		$injector
			.registerSingleton('FeatureInfoService', featureInfoService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('TranslationService', translationService);
		return store;
	};

	describe('constructor', () => {

		it('registers an i18n provider', async () => {
			const translationServiceSpy = spyOn(translationService, 'register');
			setup();

			new FeatureInfoPlugin();

			expect(translationServiceSpy).toHaveBeenCalledWith('featureInfoPluginProvider', provide);
		});
	});

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

		describe('calls the FeatureInfoService', () => {

			it('adds FeatureInfo items ', async () => {
				const layerId0 = 'id0';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [createDefaultLayer(layerId0)]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(layerId0, coordinate, resolution).and.resolveTo(new FeatureInfoResult('content', 'title'));
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.querying).toBeTrue();
				setTimeout(() => {
					expect(store.getState().featureInfo.current).toHaveSize(1);
					expect(store.getState().featureInfo.current[0].content).toBe('content');
					expect(store.getState().featureInfo.current[0].title).toBe('title');
					expect(store.getState().featureInfo.querying).toBeFalse();
				});
			});

			it('adds FeatureInfo items taking layerProperties\' label as title', async () => {
				const layerId0 = 'id0';
				const layerLabel0 = 'label0';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0), label: layerLabel0 }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(layerId0, coordinate, resolution).and.resolveTo(new FeatureInfoResult('content'));
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				setTimeout(() => {
					expect(store.getState().featureInfo.current).toHaveSize(1);
					expect(store.getState().featureInfo.current[0].content).toBe('content');
					expect(store.getState().featureInfo.current[0].title).toBe(layerLabel0);
				});
			});

			it('adds NO FeatureInfo items when layer is invisible or hidden', async () => {
				const layerId0 = 'id0';
				const layerId1 = 'id1';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [
							{ ...createDefaultLayer(layerId0), constraints: { hidden: true } },
							{ ...createDefaultLayer(layerId1), visible: false }
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
				const layerLabel0 = 'label0';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0), label: layerLabel0 }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();

				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(layerId0, coordinate, resolution).and.resolveTo(null);
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.querying).toBeTrue();
				setTimeout(() => {
					expect(store.getState().featureInfo.current).toHaveSize(0);
					expect(store.getState().featureInfo.querying).toBeFalse();
				});
			});

			it('emits a notification and logs a warning when service throws exception', async (done) => {
				const layerId0 = 'id0';
				const layerLabel0 = 'label0';
				const coordinate = [11, 22];
				const zoom = 5;
				const resolution = 25;
				const errorMessage = 'something got wrong';
				const store = setup({
					layers: {
						active: [{ ...createDefaultLayer(layerId0), label: layerLabel0 }]
					},
					position: {
						zoom: zoom
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();
				spyOn(mapService, 'calcResolution').withArgs(zoom, coordinate).and.returnValue(resolution);
				spyOn(featureInfoService, 'get').withArgs(layerId0, coordinate, resolution).and.returnValue(Promise.reject(errorMessage));
				const warnSpy = spyOn(console, 'warn');
				await instanceUnderTest.register(store);

				setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.querying).toBeTrue();
				setTimeout(() => {
					expect(store.getState().featureInfo.current).toHaveSize(0);
					expect(store.getState().notifications.latest.payload.content).toBe(`${layerLabel0}: featureInfoPlugin_featureInfoService_exception`);
					expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.WARN);
					expect(warnSpy).toHaveBeenCalledWith(errorMessage);
					expect(store.getState().featureInfo.querying).toBeFalse();
					done();
				});
			});
		});
	});
});
