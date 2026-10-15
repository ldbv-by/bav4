import { setCurrent, setReady } from '@src/store/topics/topics.action';
import { topicsReducer } from '@src/store/topics/topics.reducer';
import { TestUtils } from '@test/test-utils.js';

describe('topicsReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			topics: topicsReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().topics.current).toBeNull();
		expect(store.getState().topics.ready).toBe(false);
	});

	it('updates the active property', () => {
		const store = setup();

		setCurrent('some');

		expect(store.getState().topics.current).toBe('some');
	});

	it('marks the state as ready', () => {
		const store = setup();

		expect(store.getState().topics.ready).toBe(false);

		setReady();

		expect(store.getState().topics.ready).toBe(true);
	});
});
