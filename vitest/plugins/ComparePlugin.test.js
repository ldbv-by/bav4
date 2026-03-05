import { TestUtils } from '../test-utils.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { ComparePlugin } from '../../src/plugins/ComparePlugin.js';
import { createDefaultLayerProperties, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { layerSwipeReducer, initialState as initialLayerSwipeState } from '../../src/store/layerSwipe/layerSwipe.reducer.js';
import { Tools } from '../../src/domain/tools.js';
import { SwipeAlignment } from '../../src/store/layers/layers.action.js';
import { $injector } from '../../src/injection/index.js';
import { QueryParameters } from '../../src/domain/queryParameters.js';

describe('ComparePlugin', () => {
	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			tools: toolsReducer,
			layerSwipe: layerSwipeReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentService);
		return store;
	};

	describe('register', () => {
		it('updates the ratio value of the layerSwipe s-o-s', async () => {
			const store = setup();
			const ratio = 0.42;
			const queryParam = new URLSearchParams(`${QueryParameters.SWIPE_RATIO}=${ratio}`);
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
			const instanceUnderTest = new ComparePlugin();

			await instanceUnderTest.register(store);

			expect(store.getState().layerSwipe.ratio).toBe(ratio * 100);
		});

		describe('SWIPE_RATIO query parameter is not parsable', () => {
			it('it does nothing', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.SWIPE_RATIO}=foo`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				const instanceUnderTest = new ComparePlugin();

				await instanceUnderTest.register(store);

				expect(store.getState().layerSwipe.ratio).toBe(initialLayerSwipeState.ratio);
			});
		});
	});

	describe('when the `toolId` changes', () => {
		describe('and the COMPARE tool is active', () => {
			it('deactivates the layerSwipe s-o-s', async () => {
				const store = setup({
					tools: {
						current: Tools.COMPARE
					}
				});
				const instanceUnderTest = new ComparePlugin();
				await instanceUnderTest.register(store);

				setCurrentTool('foo');

				expect(store.getState().layerSwipe.active).toBeFalse();
			});
		});
		describe('and the COMPARE tool is NOT active', () => {
			it('updates the active property of the layerSwipe s-o-s', async () => {
				const layer = [
					{ ...createDefaultLayerProperties(), id: 'id0' },
					{ ...createDefaultLayerProperties(), id: 'id1' },
					{ ...createDefaultLayerProperties(), id: 'id2' }
				];

				const store = setup({
					layers: {
						active: [...layer]
					}
				});
				const instanceUnderTest = new ComparePlugin();
				await instanceUnderTest.register(store);

				setCurrentTool(Tools.COMPARE);

				await TestUtils.timeout();
				expect(store.getState().layerSwipe.active).toBeTrue();
			});

			describe('one or more layers are available', () => {
				describe('and the top-most layers swipeAlignment property is set to default', () => {
					it('updates the value to `LEFT`', async () => {
						const layer = [
							{ ...createDefaultLayerProperties(), id: 'id0', zIndex: 0 },
							{ ...createDefaultLayerProperties(), id: 'id1', zIndex: 1 },
							{ ...createDefaultLayerProperties(), id: 'id2', zIndex: 2 }
						];

						const store = setup({
							layers: {
								active: [...layer]
							}
						});
						const instanceUnderTest = new ComparePlugin();
						await instanceUnderTest.register(store);

						setCurrentTool(Tools.COMPARE);

						await TestUtils.timeout();
						expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
						expect(store.getState().layers.active[1].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
						expect(store.getState().layers.active[2].constraints.swipeAlignment).toEqual(SwipeAlignment.LEFT);
					});
				});

				describe('and the top-most layers swipeAlignment property is NOT set to default', () => {
					it('does nothing', async () => {
						const layer = [
							{ ...createDefaultLayerProperties(), id: 'id0', zIndex: 0 },
							{ ...createDefaultLayerProperties(), id: 'id1', zIndex: 1 },
							{ ...createDefaultLayerProperties(), id: 'id2', zIndex: 2, constraints: { swipeAlignment: SwipeAlignment.RIGHT } }
						];

						const store = setup({
							layers: {
								active: [...layer]
							}
						});
						const instanceUnderTest = new ComparePlugin();
						await instanceUnderTest.register(store);

						setCurrentTool(Tools.COMPARE);

						await TestUtils.timeout();
						expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
						expect(store.getState().layers.active[1].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
						expect(store.getState().layers.active[2].constraints.swipeAlignment).toEqual(SwipeAlignment.RIGHT);
					});
				});
			});
		});
	});
});
