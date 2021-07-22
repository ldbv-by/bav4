import { modalReducer, MODAL_CONTENT_ID } from '../../../../src/modules/modal/store/modal.reducer';
import { openModal, } from '../../../../src/modules/modal/store/modal.action';
import { TestUtils } from '../../../test-utils.js';


describe('modalAction', () => {

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, {
			modal: modalReducer
		});
	};

	describe('openModal', () => {

		it('appends the content to the document', () => {
			setup();

			openModal('title', 'content');

			expect(document.getElementById(MODAL_CONTENT_ID).innerText).toBe('content');
		});
	});
});
