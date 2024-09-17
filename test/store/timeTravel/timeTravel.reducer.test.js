import { TestUtils } from '../../test-utils.js';
import { timeTravelReducer } from '../../../src/store/timeTravel/timeTravel.reducer.js';
import { activate, deactivate, setCurrentTimestamp } from '../../../src/store/timeTravel/timeTravel.action.js';

describe('timeTravelReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			timeTravel: timeTravelReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().timeTravel.current).toBeNull();
		expect(store.getState().timeTravel.active).toBeFalse();
	});

	it("changes the 'timestamp' property", () => {
		const store = setup();

		setCurrentTimestamp('1900');

		expect(store.getState().timeTravel.current).toBe('1900');

		setCurrentTimestamp(null);

		expect(store.getState().timeTravel.current).toBeNull();
	});

	it("changes the 'active' property", () => {
		const store = setup();

		activate();

		expect(store.getState().timeTravel.active).toBeTrue();

		deactivate();

		expect(store.getState().timeTravel.active).toBeFalse();
	});
});
