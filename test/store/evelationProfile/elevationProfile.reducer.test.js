import { closeProfile, openProfile, updateCoordinates } from '../../../src/store/elevationProfile/elevationProfile.action.js';
import { elevationProfileReducer } from '../../../src/store/elevationProfile/elevationProfile.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('elevationProfileReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			elevationProfile: elevationProfileReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().elevationProfile.active).toBeFalse();
		expect(store.getState().elevationProfile.coordinates).toEqual([]);
	});

	it("updates the 'active' and optionally the 'coordinates' property", () => {
		const store = setup();

		openProfile();

		expect(store.getState().elevationProfile.active).toBeTrue();
		expect(store.getState().elevationProfile.coordinates).toEqual([]);

		closeProfile();

		expect(store.getState().elevationProfile.active).toBeFalse();
		expect(store.getState().elevationProfile.coordinates).toEqual([]);

		openProfile([[21, 42]]);

		expect(store.getState().elevationProfile.active).toBeTrue();
		expect(store.getState().elevationProfile.coordinates).toEqual([[21, 42]]);

		closeProfile();

		expect(store.getState().elevationProfile.active).toBeFalse();
		expect(store.getState().elevationProfile.coordinates).toEqual([[21, 42]]);
	});

	it("updates the 'coordinates' property", () => {
		const store = setup();

		updateCoordinates([[21, 42]]);

		expect(store.getState().elevationProfile.active).toBeFalse();
		expect(store.getState().elevationProfile.coordinates).toEqual([[21, 42]]);
	});
});
