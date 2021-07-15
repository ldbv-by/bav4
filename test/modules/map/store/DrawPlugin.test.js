import { drawReducer } from '../../../../src/modules/map/store/draw.reducer';
import { DrawPlugin, DRAW_LAYER_ID } from '../../../../src/modules/map/store/DrawPlugin';

import { activate, deactivate } from '../../../../src/modules/map/store/draw.action';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';



describe('DrawPlugin', () => {

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			draw: drawReducer,
			layers: layersReducer,
		});
		return store;
	};


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