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
		expect(store.getState().bottomSheet.active).toEqual([]);
	});

	it('updates the default bottom sheet properties', () => {
		const store = setup();

		openBottomSheet('content');

		expect(store.getState().bottomSheet.data).toEqual([{ id: 'default', content: 'content' }]);
		expect(store.getState().bottomSheet.active).toEqual(['default']);

		openBottomSheet('contentUpdate');

		expect(store.getState().bottomSheet.data).toEqual([{ id: 'default', content: 'contentUpdate' }]);
		expect(store.getState().bottomSheet.active).toEqual(['default']);

		closeBottomSheet();

		expect(store.getState().bottomSheet.data).toEqual([]);
		expect(store.getState().bottomSheet.active).toEqual([]);
	});

	it('updates also custom bottom sheet properties', () => {
		const store = setup();

		openBottomSheet('content');

		expect(store.getState().bottomSheet.data).toEqual([{ id: 'default', content: 'content' }]);
		expect(store.getState().bottomSheet.active).toEqual(['default']);

		openBottomSheet('content', 'id');

		expect(store.getState().bottomSheet.active).toEqual(['id', 'default']);
		expect(store.getState().bottomSheet.data).toEqual([
			{ id: 'id', content: 'content' },
			{ id: 'default', content: 'content' }
		]);

		openBottomSheet('contentUpdate');
		openBottomSheet('contentUpdate', 'id');

		expect(store.getState().bottomSheet.active).toEqual(['id', 'default']);
		expect(store.getState().bottomSheet.data).toEqual([
			{ id: 'id', content: 'contentUpdate' },
			{ id: 'default', content: 'contentUpdate' }
		]);

		closeBottomSheet('unknown');

		expect(store.getState().bottomSheet.active).toEqual(['id', 'default']);
		expect(store.getState().bottomSheet.data).toEqual([
			{ id: 'id', content: 'contentUpdate' },
			{ id: 'default', content: 'contentUpdate' }
		]);

		closeBottomSheet();
		closeBottomSheet('id');

		expect(store.getState().bottomSheet.data).toEqual([]);
		expect(store.getState().bottomSheet.active).toEqual([]);
	});
});
