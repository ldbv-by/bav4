import { AltitudeProfilePlugin } from '../../src/plugins/AltitudeProfilePlugin';
import { closeProfile, openProfile } from '../../src/store/altitudeProfile/altitudeProfile.action';
import { altitudeProfileReducer } from '../../src/store/altitudeProfile/altitudeProfile.reducer';
import { bottomSheetReducer } from '../../src/store/bottomSheet/bottomSheet.reducer';
import { TestUtils } from '../test-utils';

describe('AltitudeProfilePlugin', () => {

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			altitudeProfile: altitudeProfileReducer,
			bottomSheet: bottomSheetReducer
		});
		return store;
	};

	describe('when property `active` of slice-of-state `altitudeProfile` changes', () => {

		it('opens/closes the BottomSheet component', async () => {
			const store = setup();
			const instanceUnderTest = new AltitudeProfilePlugin();
			await instanceUnderTest.register(store);

			openProfile([[0, 1], [2, 3]]);

			const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data);
			expect(wrapperElement.querySelectorAll('ba-altitude-profile')).toHaveSize(1);

			closeProfile();

			expect(store.getState().bottomSheet.data).toBeNull();
		});
	});
});
