import { TestUtils } from '../../test-utils.js';
import { layerSwipeReducer } from '../../../src/store/layerSwipe/layerSwipe.reducer.js';
import { activate, deactivate, toggle, updateRatio } from '../../../src/store/layerSwipe/layerSwipe.action.js';

describe('layerSwipe reducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			layerSwipe: layerSwipeReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().layerSwipe.active).toBeFalse();
		expect(store.getState().layerSwipe.ratio).toBe(50);
	});

	it('changes the "active" property', () => {
		const store = setup();

		activate([]);

		expect(store.getState().layerSwipe.active).toBeTrue();

		deactivate();

		expect(store.getState().layerSwipe.active).toBeFalse();

		toggle();

		expect(store.getState().layerSwipe.active).toBeTrue();

		toggle();

		expect(store.getState().layerSwipe.active).toBeFalse();
	});

	it('changes the "ratio" property', () => {
		const store = setup();

		updateRatio('80');

		expect(store.getState().layerSwipe.ratio).toBe(50);

		updateRatio(-1);

		expect(store.getState().layerSwipe.ratio).toBe(50);

		updateRatio(101);

		expect(store.getState().layerSwipe.ratio).toBe(50);

		updateRatio(75);

		expect(store.getState().layerSwipe.ratio).toBe(75);
	});
});
