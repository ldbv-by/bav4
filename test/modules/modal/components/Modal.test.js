import { Modal } from '../../../../src/modules/modal/components/Modal';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils';
import { html, TemplateResult } from 'lit-html';
import { closeModal, openModal } from '../../../../src/store/modal/modal.action';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';


window.customElements.define(Modal.tag, Modal);


describe('Modal', () => {

	let store;

	const setup = (state = {}) => {

		const initialState = {
			media: {
				portrait: false
			},
			...state

		};

		store = TestUtils.setupStoreAndDi(initialState, {
			modal: modalReducer,
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(Modal.tag);
	};

	describe('when initialized', () => {

		it('renders no content', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when modal state changed', () => {

		it('adds content to modal from a string', async () => {

			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			openModal('title', 'content');

			expect(store.getState().modal.data.title).toBe('title');
			expect(store.getState().modal.data.content).toBe('content');
			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal__title').innerText).toMatch(/title[\r\n]?/);
			//Note: Webkit appends a line break to the 'content' in this case
			expect(element.shadowRoot.querySelector('.modal__content').innerText).toMatch(/content[\r\n]?/);
		});

		it('adds content to modal from a lit-html TemplateResult', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			const template = (str) => html`${str}`;

			openModal('title', template('content'));

			expect(store.getState().modal.data.title).toBe('title');
			expect(store.getState().modal.data.content).toBeInstanceOf(TemplateResult);
			expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.modal__title').innerText).toMatch(/title[\r\n]?/);
			//Note: Webkit appends a line break to the 'content' in this case
			expect(element.shadowRoot.querySelector('.modal__content').innerText).toMatch(/content[\r\n]?/);
		});

		it('closes the modal', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			openModal('title', 'content');

			closeModal();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		describe('when close button clicked', () => {

			it('closes the modal', async () => {
				const state = {
					media: {
						portrait: false
					}
				};

				const element = await setup(state);
				openModal('title', 'content');

				const closeBtn = element.shadowRoot.querySelector('ba-button');
				closeBtn.click();

				const elementModal = element.shadowRoot.querySelector('.modal__container');
				elementModal.dispatchEvent(new Event('animationend'));

				expect(store.getState().modal.active).toBeFalse();
			});
		});

		describe('when background clicked', () => {

			it('closes the modal', async () => {
				const state = {
					media: {
						portrait: false
					}
				};

				const element = await setup(state);
				openModal('title', 'content');

				const background = element.shadowRoot.querySelector('.modal__background');
				background.click();

				const elementModal = element.shadowRoot.querySelector('.modal__container');
				elementModal.dispatchEvent(new Event('animationend'));

				expect(store.getState().modal.active).toBeFalse();
			});
		});
	});
});
