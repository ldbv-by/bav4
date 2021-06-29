import { Modal } from '../../../../src/modules/modal/components/Modal';
import { closeModal, openModal } from '../../../../src/modules/modal/store/modal.action';
import { modalReducer } from '../../../../src/modules/modal/store/modal.reducer';
import { $injector } from '../../../../src/injection';
import { html } from 'lit-html';
import { TestUtils } from '../../../test-utils';


window.customElements.define(Modal.tag, Modal);


describe('Modal', () => {

	let store;

	const setup = (state = {}) => {

		store = TestUtils.setupStoreAndDi(state, { modal: modalReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(Modal.tag);
	};

	describe('when initialized', () => {

		it('renders no content', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('renders the content', async () => {
			const data = { title: 'foo', content: html`<p class="bar">bar<p/>` };

			const element = await setup({
				modal: {
					data: data,
					active: true
				}
			});

			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal__title').innerText).toBe('foo');
			expect(element.shadowRoot.querySelector('.bar').innerText).toBe('bar');
		});
	});

	describe('when modal state changed', () => {

		it('adds content to modal', async () => {
			const element = await setup();
			const data = { title: 'foo', content: html`<p class='bar'>bar<p/>` };

			openModal(data);

			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal__title').innerText).toBe('foo');
			expect(element.shadowRoot.querySelector('.bar').innerText).toBe('bar');
		});

		it('closes the modal', async () => {
			const data = { title: 'foo', content: html`<p class="bar">bar<p/>` };
			const element = await setup({
				modal: {
					data: data,
					active: true
				}
			});

			closeModal();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		describe('when close button clicked', () => {

			it('closes the modal', async () => {
				const data = { title: 'foo', content: html`<p class="bar">bar<p/>` };
				const element = await setup({
					modal: {
						data: data,
						active: true
					}
				});

				const closeBtn = element.shadowRoot.querySelector('ba-button');
				closeBtn.click();

				expect(store.getState().modal.active).toBeFalse();
			});
		});

		describe('when background clicked', () => {

			it('closes the modal', async () => {

				const data = { title: 'foo', content: html`<p class="bar">bar<p/>` };
				const element = await setup({
					modal: {
						data: data,
						active: true
					}
				});

				const background = element.shadowRoot.querySelector('.modal__background');
				background.click();

				expect(store.getState().modal.active).toBeFalse();
			});
		});
	});
});