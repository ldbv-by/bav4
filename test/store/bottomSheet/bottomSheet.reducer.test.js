import { openBottomSheet, closeBottomSheet } from '../../../src/store/bottomSheet/bottomSheet.action';
import { bottomSheetReducer } from '../../../src/store/bottomSheet/bottomSheet.reducer.js';
import { TestUtils } from '../../test-utils.js';


describe('modalReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			bottomSheet: bottomSheetReducer
		});
	};

	it('initialize the store with default values', () => {
		const store = setup();
		expect(store.getState().bottomSheet.data).toBeNull();
		expect(store.getState().bottomSheet.active).toBeFalse();
	});

	it('updates the stores properties', () => {
		const store = setup();

		openBottomSheet('content');

		expect(store.getState().bottomSheet.data).toEqual('content');
		expect(store.getState().bottomSheet.active).toBeTrue();

		closeBottomSheet();

		expect(store.getState().bottomSheet.data).toBeNull();
		expect(store.getState().bottomSheet.active).toBeFalse();
	});
});
