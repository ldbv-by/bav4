import { closeProfile, openProfile, updateCoordinates } from '../../../src/store/altitudeProfile/altitudeProfile.action.js';
import { altitudeProfileReducer } from '../../../src/store/altitudeProfile/altitudeProfile.reducer.js';
import { TestUtils } from '../../test-utils.js';


describe('altitudeProfileReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			altitudeProfile: altitudeProfileReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().altitudeProfile.active).toBeFalse();
		expect(store.getState().altitudeProfile.coordinates).toEqual([]);
	});

	it('updates the \'active\' and optionally the \'coordinates\' property', () => {
		const store = setup();

		openProfile();

		expect(store.getState().altitudeProfile.active).toBeTrue();
		expect(store.getState().altitudeProfile.coordinates).toEqual([]);

		closeProfile();

		expect(store.getState().altitudeProfile.active).toBeFalse();
		expect(store.getState().altitudeProfile.coordinates).toEqual([]);

		openProfile([[21, 42]]);

		expect(store.getState().altitudeProfile.active).toBeTrue();
		expect(store.getState().altitudeProfile.coordinates).toEqual([[21, 42]]);

		closeProfile();

		expect(store.getState().altitudeProfile.active).toBeFalse();
		expect(store.getState().altitudeProfile.coordinates).toEqual([[21, 42]]);
	});

	it('updates the \'coordinates\' property', () => {
		const store = setup();

		updateCoordinates([[21, 42]]);

		expect(store.getState().altitudeProfile.active).toBeFalse();
		expect(store.getState().altitudeProfile.coordinates).toEqual([[21, 42]]);
	});
});
