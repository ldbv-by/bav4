import { TestUtils } from '../../../test-utils.js';
import { toolBarReducer } from '../../../../src/modules/menu/store/toolBar.reducer';
import { openToolBar, closeToolBar, toggleToolBar } from '../../../../src/modules/menu/store/toolBar.action';


describe('toolBarReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			toolBar: toolBarReducer
		});
	};


	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().toolBar.open).toBeFalse();
	});
	describe('changes the \'open\' property', () => {

		it('sets true', () => {
			const store = setup();


			openToolBar();

			expect(store.getState().toolBar.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup({ toolBar: { open: true } });

			expect(store.getState().toolBar.open).toBeTrue();

			closeToolBar();

			expect(store.getState().toolBar.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup({ toolBar: { open: true } });

			expect(store.getState().toolBar.open).toBeTrue();

			toggleToolBar();

			expect(store.getState().toolBar.open).toBeFalse();

			toggleToolBar();

			expect(store.getState().toolBar.open).toBeTrue();
		});


	});
});
