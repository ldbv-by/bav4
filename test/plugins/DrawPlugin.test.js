import { TestUtils } from '@test/test-utils.js';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { DrawPlugin, DRAW_LAYER_ID } from '@src/plugins/DrawPlugin.js';
import { activate, deactivate } from '@src/store/draw/draw.action.js';
import { drawReducer } from '@src/store/draw/draw.reducer.js';
import { setCurrentTool } from '@src/store/tools/tools.action.js';
import { toolsReducer } from '@src/store/tools/tools.reducer.js';
import { Tools } from '@src/domain/tools.js';

describe('DrawPlugin', () => {
	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			draw: drawReducer,
			layers: layersReducer,
			tools: toolsReducer
		});
		return store;
	};

	describe('when toolId changes', () => {
		it('updates the active property (I)', async () => {
			const store = setup();
			const instanceUnderTest = new DrawPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool(Tools.DRAW);

			await TestUtils.timeout();
			expect(store.getState().draw.active).toBe(true);
		});

		it('updates the active property (II)', async () => {
			const store = setup({
				tools: {
					current: Tools.DRAW
				}
			});
			const instanceUnderTest = new DrawPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			expect(store.getState().draw.active).toBe(false);
		});
	});
	describe('when active property changes', () => {
		it('adds or removes the draw layer', async () => {
			const store = setup();
			const instanceUnderTest = new DrawPlugin();
			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active).toHaveLength(1);
			expect(store.getState().layers.active[0].id).toBe(DRAW_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBe(true);
			expect(store.getState().layers.active[0].constraints.hidden).toBe(true);

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});
});
