import { openBottomSheet, closeBottomSheet } from '../../../src/store/bottomSheet/bottomSheet.action';
import { bottomSheetReducer } from '../../../src/store/bottomSheet/bottomSheet.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('bottomSheetReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			bottomSheet: bottomSheetReducer
		});
	};

	it('initialize the store with default values', () => {
		const store = setup();
		expect(store.getState().bottomSheet.data).toEqual([]);
		expect(store.getState().bottomSheet.active).toBeNull();
	});

	it('updates the main bottom sheet properties', () => {
		const store = setup();

		openBottomSheet('content');

		expect(store.getState().bottomSheet.data).toEqual(jasmine.arrayWithExactContents([{ id: 'main', content: 'content' }]));
		expect(store.getState().bottomSheet.active).toBe('main');

		closeBottomSheet();

		expect(store.getState().bottomSheet.data).toEqual(jasmine.arrayWithExactContents([{ id: 'main', content: null }]));
		expect(store.getState().bottomSheet.active).toBeNull();
	});

	it('updates the other bottom sheet properties', () => {
		const store = setup();

		openBottomSheet('content');

		expect(store.getState().bottomSheet.data).toEqual(jasmine.arrayWithExactContents([{ id: 'main', content: 'content' }]));
		expect(store.getState().bottomSheet.active).toBe('main');

		openBottomSheet('content', 'some');

		expect(store.getState().bottomSheet.active).toBe('some');
		expect(store.getState().bottomSheet.data).toEqual(
			jasmine.arrayWithExactContents([
				{ id: 'some', content: 'content' },
				{ id: 'main', content: 'content' }
			])
		);

		openBottomSheet('contentUpdate');
		openBottomSheet('contentUpdate', 'some');

		closeBottomSheet();
		closeBottomSheet('some');

		expect(store.getState().bottomSheet.data).toEqual(
			jasmine.arrayWithExactContents([
				{ id: 'some', content: null },
				{ id: 'main', content: null }
			])
		);
		expect(store.getState().bottomSheet.active).toBeNull();

		closeBottomSheet('unknown');

		expect(store.getState().bottomSheet.data).toEqual(
			jasmine.arrayWithExactContents([
				{ id: 'some', content: null },
				{ id: 'main', content: null }
			])
		);
		expect(store.getState().bottomSheet.active).toBeNull();
	});
});
