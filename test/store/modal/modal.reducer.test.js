import { closeModal, openModal } from '../../../src/store/modal/modal.action.js';
import { modalReducer } from '../../../src/store/modal/modal.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('modalReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			modal: modalReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().modal.active).toBeFalse();
		expect(store.getState().modal.data).toBeNull();
	});

	it('updates the stores properties', () => {
		const store = setup();

		openModal('title', 'content');

		expect(store.getState().modal.data.title).toEqual('title');
		expect(store.getState().modal.active).toBeTrue();

		closeModal();

		expect(store.getState().modal.data).toBeNull();
		expect(store.getState().modal.active).toBeFalse();
	});
});
