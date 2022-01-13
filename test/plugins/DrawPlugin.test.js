import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { DrawPlugin, DRAW_LAYER_ID } from '../../src/plugins/DrawPlugin.js';
import { activate, deactivate } from '../../src/store/draw/draw.action.js';
import { drawReducer } from '../../src/store/draw/draw.reducer.js';
import { setCurrentTool, ToolId } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';



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
		it('updates the active property (I)', async (done) => {
			const store = setup();
			const instanceUnderTest = new DrawPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool(ToolId.DRAWING);

			setTimeout(() => {
				expect(store.getState().draw.active).toBeTrue();
				done();
			});
		});

		it('updates the active property (II)', async () => {
			const store = setup({
				tools: {
					current: ToolId.DRAWING
				}
			});
			const instanceUnderTest = new DrawPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			expect(store.getState().draw.active).toBeFalse();
		});
	});
	describe('when active property changes', () => {
		it('adds or removes the draw layer', async () => {
			const store = setup();
			const instanceUnderTest = new DrawPlugin();
			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(DRAW_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});
});
