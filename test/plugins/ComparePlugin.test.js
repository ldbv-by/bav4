import { TestUtils } from '../test-utils.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { ComparePlugin } from '../../src/plugins/ComparePlugin.js';
import { createDefaultLayerProperties, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { layerSwipeReducer } from '../../src/store/layerSwipe/layerSwipe.reducer.js';
import { Tools } from '../../src/domain/tools.js';
import { SwipeAlignment } from '../../src/store/layers/layers.action.js';

describe('ComparePlugin', () => {
	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			tools: toolsReducer,
			layerSwipe: layerSwipeReducer
		});
		return store;
	};

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
			describe('and less than two layers are available', () => {
				it('does nothing', async () => {
					const store = setup();
					const instanceUnderTest = new ComparePlugin();
					await instanceUnderTest.register(store);

					setCurrentTool(Tools.COMPARE);

					await TestUtils.timeout();
					expect(store.getState().layerSwipe.active).toBeFalse();
				});
			});
			describe('and two or more layers are available', () => {
				it('updates the active property of the layerSwipe s-o-s', async () => {
					const layer = [
						{ ...createDefaultLayerProperties(), id: 'id0' },
						{ ...createDefaultLayerProperties(), id: 'id1' },
						{ ...createDefaultLayerProperties(), id: 'id2' }
						// { ...createDefaultLayerProperties(), id: 'id2', geoResourceId: '2', constraints: { hidden: true } }
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

				describe('and the top-most layers swipeAlignment property is set to default', () => {
					it('updates the value to `LEFT`', async () => {
						const layer = [
							{ ...createDefaultLayerProperties(), id: 'id0', zIndex: 0 },
							{ ...createDefaultLayerProperties(), id: 'id1', zIndex: 1 },
							{ ...createDefaultLayerProperties(), id: 'id2', zIndex: 2 }
							// { ...createDefaultLayerProperties(), id: 'id2', geoResourceId: '2', constraints: { hidden: true } }
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
