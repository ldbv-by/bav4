import { MeasurementPlugin, MEASUREMENT_LAYER_ID } from '../../src/plugins/MeasurementPlugin';

import { activate, deactivate } from '../../src/store/measurement/measurement.action';
import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { measurementReducer } from '../../src/store/measurement/measurement.reducer';
import { toolsReducer } from '../../src/store/tools/tools.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action';
import { Tools } from '../../src/domain/tools';

describe('MeasurementPlugin', () => {
	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer,
			layers: layersReducer,
			tools: toolsReducer
		});
		return store;
	};

	describe('when toolId changes', () => {
		it('updates the active property (I)', async () => {
			const store = setup();
			const instanceUnderTest = new MeasurementPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool(Tools.MEASURE);

			await TestUtils.timeout();
			expect(store.getState().measurement.active).toBeTrue();
		});

		it('updates the active property (II)', async () => {
			const store = setup({
				tools: {
					current: Tools.MEASURE
				}
			});
			const instanceUnderTest = new MeasurementPlugin();
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			expect(store.getState().measurement.active).toBeFalse();
		});
	});

	describe('when active property changes', () => {
		it('adds or removes the measurement layer', async () => {
			const store = setup();
			const instanceUnderTest = new MeasurementPlugin();
			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(MEASUREMENT_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});
});
