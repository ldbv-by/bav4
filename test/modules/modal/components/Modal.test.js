import { NO_CONTENT, Modal } from '../../../../src/modules/modal/components/Modal';
import { modalClose, modalOpen } from '../../../../src/modules/modal/store/modal.action';
import { modalReducer } from '../../../../src/modules/modal/store/modal.reducer';
import { $injector } from '../../../../src/injection';

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
				
			expect(element.shadowRoot.querySelector('.modal--active')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();        
	
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
			const modalContent = { title:'foo', content:'<p class=\'bar\'>bar<p/>' };

			modalOpen(modalContent);

			expect(element.shadowRoot.querySelector('.modal--active')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.bar').innerText).toBe('bar');			
		});

		it('adds title to modal', () => {
			const modalContent = { title:'foo', content:'bar' };

			modalOpen(modalContent);

			expect(element.shadowRoot.querySelector('.modal--active')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal-title').innerText).toBe('foo');		
		});
		
		it('adds no title to modal', () => {
			const modalContent = { title:undefined, content:'bar' };

			modalOpen(modalContent);

			expect(element.shadowRoot.querySelector('.modal--active')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal-title').innerText).toBe(NO_CONTENT);		
		});
		
		it('resets modal to default after close-action', () => {
			const modalContent = { title:'foo', content:'<p class=\'bar\'>bar<p/>' };

			modalOpen(modalContent);
			const wasActive=element.shadowRoot.querySelector('.modal--active')!==undefined;
			const hadTitle=element.shadowRoot.querySelector('.modal-title').innerText == 'foo';
			const hadContent=element.shadowRoot.querySelector('.bar').innerText == 'bar';

			modalClose();

			expect(wasActive).toBe(true);
			expect(hadTitle).toBe(true);
			expect(hadContent).toBe(true);
			expect(element.shadowRoot.querySelector('.modal--active')).toBeFalsy();			
			expect(element.shadowRoot.querySelector('.modal-title').innerText).toBe(NO_CONTENT);
			expect(element.shadowRoot.querySelector('.modal-body').innerText).toBe(NO_CONTENT);		
		});		
	});

	describe('when state is changed ', () => {
		let store;
		beforeEach(async () => {

			const state = {
				modal: { title: false, content: false }
			};

			store=	TestUtils.setupStoreAndDi(state, {
				modal: modalReducer
			});
			$injector
				.registerSingleton('TranslationService', { translate: (key) => key });


			element = await TestUtils.render(Modal.tag);
		});

		it('resets modal to default after close-button is clicked', async () => {
			const modalContent = { title:'foo', content:'<p class=\'bar\'>bar<p/>' };

			modalOpen(modalContent);			
			const wasActive=element.shadowRoot.querySelector('.modal--active')!==undefined;
			const hadTitle=element.shadowRoot.querySelector('.modal-title').innerText == 'foo';
			const hadContent=element.shadowRoot.querySelector('.bar').innerText == 'bar';
			element.shadowRoot.querySelector('#modal-close').onClick.call();

			expect(wasActive).toBe(true);
			expect(hadTitle).toBe(true);
			expect(hadContent).toBe(true);
			expect(store.getState().modal.title).toBe(false);
			expect(store.getState().modal.content).toBe(false);        	
		});
	});
});