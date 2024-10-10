import { TestUtils } from '../../test-utils.js';
import { timeTravelReducer } from '../../../src/store/timeTravel/timeTravel.reducer.js';
import { setCurrentTimestamp, openSlider, closeSlider } from '../../../src/store/timeTravel/timeTravel.action.js';

describe('timeTravelReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			timeTravel: timeTravelReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().timeTravel.timestamp).toBeNull();
		expect(store.getState().timeTravel.active).toBeFalse();
	});

	it("changes the 'timestamp' property", () => {
		const store = setup();

		setCurrentTimestamp('1900');

		expect(store.getState().timeTravel.timestamp).toBe('1900');

		setCurrentTimestamp(null);

		expect(store.getState().timeTravel.timestamp).toBeNull();
	});

	it("opens the slider and optionally updates the 'timestamp' property", () => {
		const store = setup();

		openSlider();

		expect(store.getState().timeTravel.active).toBeTrue();
		expect(store.getState().timeTravel.timestamp).toBeNull();

		openSlider('1900');

		expect(store.getState().timeTravel.active).toBeTrue();
		expect(store.getState().timeTravel.timestamp).toBe('1900');

		openSlider('2000');

		expect(store.getState().timeTravel.active).toBeTrue();
		expect(store.getState().timeTravel.timestamp).toBe('2000');
	});

	it('closes the slider', () => {
		const store = setup({
			timeTravel: {
				active: true,
				timestamp: '1900'
			}
		});

		closeSlider();

		expect(store.getState().timeTravel.active).toBeFalse();
		expect(store.getState().timeTravel.timestamp).toBe('1900');
	});
});
