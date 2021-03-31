import { TestUtils } from '../../../test-utils.js';
import { contentPanelReducer } from '../../../../src/modules/menu/store/contentPanel.reducer';
import { openContentPanel, closeContentPanel, toggleContentPanel } from '../../../../src/modules/menu/store/contentPanel.action';


describe('contentPanelReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			contentPanel: contentPanelReducer
		});
	};


	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().contentPanel.open).toBeTrue();
	});
	describe('changes the \'open\' property', () => {

		it('sets true', () => {
			const store = setup();


			openContentPanel();

			expect(store.getState().contentPanel.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup({ contentPanel: { open: true } });

			expect(store.getState().contentPanel.open).toBeTrue();

			closeContentPanel();

			expect(store.getState().contentPanel.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup({ contentPanel: { open: true } });

			expect(store.getState().contentPanel.open).toBeTrue();

			toggleContentPanel();

			expect(store.getState().contentPanel.open).toBeFalse();

			toggleContentPanel();

			expect(store.getState().contentPanel.open).toBeTrue();
		});


	});
});
