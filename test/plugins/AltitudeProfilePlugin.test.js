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

	describe('when `active` of slice-of-state `altitudeProfile` changes', () => {

		fit('opens/closes the BottomSheet component', async () => {
			const store = setup();
			const instanceUnderTest = new AltitudeProfilePlugin();
			await instanceUnderTest.register(store);

			openProfile([[0, 1], [2, 3]]);

			expect(store.getState().bottomSheet.data).toBe('Comming soon ... the AltitudeProfile component');

			closeProfile();

			expect(store.getState().bottomSheet.data).toBeNull();
		});
	});
});
