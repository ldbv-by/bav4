import { TestUtils } from '../../../test-utils.js';
import { topicsReducer } from '../../../../src/modules/topics/store/topics.reducer';
import { setCurrent } from '../../../../src/modules/topics/store/topics.action.js';



describe('topicsReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			topics: topicsReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().topics.current).toBeNull();
	});

	it('updates the active property', () => {
		const store = setup();

		setCurrent('some');

		expect(store.getState().topics.current).toBe('some');
	});
});
