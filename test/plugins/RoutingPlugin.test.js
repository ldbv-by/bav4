import { RoutingPlugin, ROUTING_LAYER_ID } from '../../src/plugins/RoutingPlugin';

import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { routingReducer } from '../../src/store/routing/routing.reducer';
import { toolsReducer } from '../../src/store/tools/tools.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action';
import { Tools } from '../../src/domain/tools';
import { deactivate, activate } from '../../src/store/routing/routing.action';

describe('RoutingPlugin', () => {
	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			routing: routingReducer,
			layers: layersReducer,
			tools: toolsReducer
		});
		return store;
	};

	describe('when toolId changes', () => {
		it('updates the active property (I)', async () => {
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool(Tools.ROUTING);

			await TestUtils.timeout();
			expect(store.getState().routing.active).toBeTrue();
		});

		it('updates the active property (II)', async () => {
			const store = setup({
				tools: {
					current: Tools.ROUTING
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			expect(store.getState().routing.active).toBeFalse();
		});
	});

	describe('when active property changes', () => {
		it('adds or removes the routing layer', async () => {
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(ROUTING_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});
});
