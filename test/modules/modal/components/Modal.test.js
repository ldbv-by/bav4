import { Modal } from '../../../../src/modules/modal/components/Modal';
import { closeModal, openModal } from '../../../../src/modules/modal/store/modal.action';
import { modalReducer } from '../../../../src/modules/modal/store/modal.reducer';
import { $injector } from '../../../../src/injection';
import { html } from 'lit-html';

import { TestUtils } from '../../../test-utils';
window.customElements.define(Modal.tag, Modal);

const setupStoreAndDi = (state) => {
	TestUtils.setupStoreAndDi(state, { modal: modalReducer });
};

describe('Modal', () => {
	let element;

	describe('when initialized', () => {
		it('is hidden with no content', async () => {
			setupStoreAndDi({
				modal: { title: false, content: false }
			});
			$injector
				.registerSingleton('TranslationService', { translate: (key) => key });

				
			element = await TestUtils.render(Modal.tag);
				
			expect(element.innerText).toBeFalsy();
		});
	});

	describe('when modal state changed', () =>{
		beforeEach(async () => {

			const state = {
				modal: { title: false, content: false }
			};

			TestUtils.setupStoreAndDi(state, {
				modal: modalReducer
			});
			$injector
				.registerSingleton('TranslationService', { translate: (key) => key });


			element = await TestUtils.render(Modal.tag);
		});

		it('adds content to modal', () => {
			const modalContent = { title:'foo', content: html `<p class=\'bar\'>bar<p/>` };

			openModal(modalContent);

			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.bar').innerText).toBe('bar');			
		});

		it('adds title to modal', () => {
			const modalContent = { title:'foo', content: html `bar` };

			openModal(modalContent);

			expect(element.shadowRoot.querySelector('.modal-title').innerText).toBe('foo');		
		});
		
		it('adds no title to modal', () => {
			const modalContent = { title:undefined, content:'bar' };

			openModal(modalContent);

			expect(element.shadowRoot.querySelector('.modal-title').innerText).toBe('');		
		});
		
		it('resets modal to default after close-action', () => {
			const modalContent = { title:'foo', content: html `<p class="bar">bar<p/>` };

			openModal(modalContent);
			const hadTitle=element.shadowRoot.querySelector('.modal-title').innerText == 'foo';
			const hadContent=element.shadowRoot.querySelector('.bar').innerText == 'bar';

			closeModal();

			expect(hadTitle).toBe(true);
			expect(hadContent).toBe(true);
			expect(element.innerText).toBeFalsy();
		});		

		it('closes the modal on close-button click', async () => {
			
			const modalContent = { title: 'foo', content: html `<p class="bar">bar<p/>` };

			openModal(modalContent);			
			const hadTitle=element.shadowRoot.querySelector('.modal-title').innerText == 'foo';
			const hadContent=element.shadowRoot.querySelector('.bar').innerText == 'bar';

			const closeBtn = element.shadowRoot.querySelector('ba-button');
			closeBtn.click();
			
			expect(hadTitle).toBe(true);
			expect(hadContent).toBe(true);
			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});
});