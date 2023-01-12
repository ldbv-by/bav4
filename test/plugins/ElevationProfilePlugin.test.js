import { ElevationProfilePlugin } from '../../src/plugins/ElevationProfilePlugin';
import { closeProfile, openProfile } from '../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer } from '../../src/store/elevationProfile/elevationProfile.reducer';
import { bottomSheetReducer } from '../../src/store/bottomSheet/bottomSheet.reducer';
import { TestUtils } from '../test-utils';

describe('ElevationProfilePlugin', () => {

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			elevationProfile: elevationProfileReducer,
			bottomSheet: bottomSheetReducer
		});
		return store;
	};

	describe('when property `active` of slice-of-state `elevationProfile` changes', () => {

		it('opens/closes the BottomSheet component', async () => {
			const store = setup();
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);

			openProfile([[0, 1], [2, 3]]);

			const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data);
			expect(wrapperElement.querySelectorAll('ba-elevation-profile')).toHaveSize(1);

			closeProfile();

			expect(store.getState().bottomSheet.data).toBeNull();
		});
	});
});
