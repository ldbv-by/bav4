import { closeProfile, indicateChange, openProfile, updateCoordinates } from '../../../src/store/elevationProfile/elevationProfile.action.js';
import { elevationProfileReducer } from '../../../src/store/elevationProfile/elevationProfile.reducer.js';
import { EventLike } from '../../../src/utils/storeUtils.js';
import { TestUtils } from '../../test-utils.js';
import { hashCode } from '../../../src/utils/hashCode';

describe('elevationProfileReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			elevationProfile: elevationProfileReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().elevationProfile.active).toBeFalse();
		expect(store.getState().elevationProfile.id).toBeNull();
	});

	it("updates the 'active'", () => {
		const store = setup();

		openProfile();

		expect(store.getState().elevationProfile.active).toBeTrue();

		closeProfile();

		expect(store.getState().elevationProfile.active).toBeFalse();
	});

	it('updates the `changed` property', () => {
		const store = setup();
		const id = 'jkhasdu';

		indicateChange(id);

		expect(store.getState().elevationProfile.id).toBe(id);
	});
});
