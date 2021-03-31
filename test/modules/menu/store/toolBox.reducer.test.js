import { TestUtils } from '../../../test-utils.js';
import { toolBoxReducer } from '../../../../src/modules/menu/store/toolBox.reducer';
import { openToolBox, closeToolBox, toggleToolBox } from '../../../../src/modules/menu/store/toolBox.action';


describe('toolBoxReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			toolBox: toolBoxReducer
		});
	};


	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().toolBox.open).toBeFalse();
	});
	describe('changes the \'open\' property', () => {

		it('sets true', () => {
			const store = setup();


			openToolBox();

			expect(store.getState().toolBox.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup({ toolBox: { open: true } });

			expect(store.getState().toolBox.open).toBeTrue();

			closeToolBox();

			expect(store.getState().toolBox.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup({ toolBox: { open: true } });

			expect(store.getState().toolBox.open).toBeTrue();

			toggleToolBox();

			expect(store.getState().toolBox.open).toBeFalse();

			toggleToolBox();

			expect(store.getState().toolBox.open).toBeTrue();
		});


	});
});
