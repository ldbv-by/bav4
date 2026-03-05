import { setCurrent } from '../../../src/store/chips/chips.action';
import { chipsReducer } from '../../../src/store/chips/chips.reducer';
import { TestUtils } from '../../test-utils.js';

describe('chipsReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			chips: chipsReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().chips.current).toEqual([]);
	});

	it("changes the 'current' property", () => {
		const chips = [{ id: 'id' }];
		const store = setup();

		setCurrent({ id: 'id' });

		expect(store.getState().chips.current).toEqual([]);

		setCurrent(chips);

		expect(store.getState().chips.current).toEqual(chips);
	});
});
