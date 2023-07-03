import { Modal } from '../../../../src/modules/modal/components/Modal';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils';
import { html } from 'lit-html';
import { closeModal, incrementStep, openModal } from '../../../../src/store/modal/modal.action';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { setIsPortrait } from '../../../../src/store/media/media.action';
import { isTemplateResult } from '../../../../src/utils/checks';
import { TEST_ID_ATTRIBUTE_NAME, findAllBySelector } from '../../../../src/utils/markup';

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
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(Modal.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new Modal();

			expect(element.getModel()).toEqual({
				data: null,
				active: false,
				portrait: true,
				currentStep: 0
			});
		});
	});

	describe('when initialized', () => {
		it('renders no content', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when model changes', () => {
		describe('modal.portrait', () => {
			it('adds the corresponding css class and ids', async () => {
				const state = {
					media: {
						portrait: false,
						observeResponsiveParameter: true
					}
				};
				const element = await setup(state);

				openModal('title', 'content');

				expect(element.shadowRoot.querySelector('.modal__container').classList).toContain('is-landscape');
				expect(element.shadowRoot.querySelector('.modal__container').classList).not.toContain('is-portrait');

				setIsPortrait(true);

				expect(element.shadowRoot.querySelector('.modal__container').classList).not.toContain('is-landscape');
				expect(element.shadowRoot.querySelector('.modal__container').classList).toContain('is-portrait');

				expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(2);
				expect(element.shadowRoot.querySelector('#close_button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
				expect(element.shadowRoot.querySelector('#back_button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			});
		});

		describe('modal.data', () => {
			it('adds content from a string', async () => {
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

			it('adds content from a lit-html TemplateResult', async () => {
				const state = {
					media: {
						portrait: false
					}
				};
				const element = await setup(state);

				openModal('title', html`'content`);

				expect(store.getState().modal.data.title).toBe('title');
				expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();
				expect(element.shadowRoot.querySelector('.modal')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.modal__title').innerText).toMatch(/title[\r\n]?/);
				//Note: Webkit appends a line break to the 'content' in this case
				expect(element.shadowRoot.querySelector('.modal__content').innerText).toMatch(/content[\r\n]?/);
			});

			it('puts the focus on the first element containing the "autofocus" attribute', async () => {
				const state = {
					media: {
						portrait: false
					}
				};
				const element = await setup(state);

				openModal('title', html`<input type="button" autofocus value="Foo"></input>`);

				await TestUtils.timeout();
				expect(findAllBySelector(element, 'input')[0]?.matches(':focus')).toBeTrue();
			});
		});

		describe('modal.active', () => {
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
		});
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

		it('closes the modal, even if we are not in the first step', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state);
			openModal('title', 'content', { steps: 2 });
			incrementStep();

			const closeBtn = element.shadowRoot.querySelector('ba-button');
			closeBtn.click();

			const elementModal = element.shadowRoot.querySelector('.modal__container');
			elementModal.dispatchEvent(new Event('animationend'));

			expect(store.getState().modal.active).toBeFalse();
		});
	});

	describe('when back button clicked', () => {
		describe('we are on the first step', () => {
			it('closes the modal', async () => {
				const state = {
					media: {
						portrait: false
					}
				};
				const element = await setup(state);
				openModal('title', 'content');

				const backIcon = element.shadowRoot.querySelector('ba-icon');
				backIcon.click();

				const elementModal = element.shadowRoot.querySelector('.modal__container');
				elementModal.dispatchEvent(new Event('animationend'));

				expect(store.getState().modal.active).toBeFalse();
			});
		});
		describe('we are NOT on the first step', () => {
			it('updates the modal slice-of-state', async () => {
				const state = {
					media: {
						portrait: false
					}
				};
				const element = await setup(state);
				openModal('title', 'content', { steps: 2 });
				incrementStep();

				expect(store.getState().modal.currentStep).toBe(1);

				const backIcon = element.shadowRoot.querySelector('ba-icon');
				backIcon.click();

				expect(store.getState().modal.currentStep).toBe(0);
			});
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

	describe('when "ESC" key is pressed', () => {
		it('closes the modal', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
			const preventDefaultSpy = spyOn(escEvent, 'preventDefault');
			await setup(state);
			openModal('title', 'content');

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); //should do nothing

			expect(store.getState().modal.active).toBeTrue();

			document.dispatchEvent(escEvent);

			expect(store.getState().modal.active).toBeFalse();
			expect(preventDefaultSpy).toHaveBeenCalled();
		});
	});

	describe('when modal is closed', () => {
		it('removes the keyDown-listener', async () => {
			const spy = spyOn(document, 'removeEventListener').and.callThrough();
			const state = {
				media: {
					portrait: false
				}
			};
			await setup(state);
			openModal('title', 'content');

			closeModal();

			expect(spy).toHaveBeenCalledWith('keydown', jasmine.anything());
		});
	});

	describe('when disconnected', () => {
		it('removes all event listeners', async () => {
			const element = await setup();
			const removeEventListenerSpy = spyOn(document, 'removeEventListener').and.callThrough();

			element.onDisconnect(); // we call onDisconnect manually

			expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', jasmine.anything());
		});
	});
});
