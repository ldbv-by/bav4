/**
 * @module modules/modal/components/Modal
 */
import { html, nothing } from 'lit-html';
import css from './modal.css';
import { $injector } from '../../../injection';
import { closeModal, decrementStep } from '../../../store/modal/modal.action';
import arrowLeftShort from '../assets/arrowLeftShort.svg';
import { MvuElement } from '../../MvuElement';
import { findAllBySelector } from '../../../utils/markup';

const Update_Modal_Data = 'update_modal_data';
const Update_IsPortrait_Value = 'update_isportrait_value';

/**
 * Modal dialog container.
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 * @author taulinger
 */
export class Modal extends MvuElement {
	#translationService;
	#escKeyListener;

	constructor() {
		super({
			data: null,
			active: false,
			portrait: true,
			currentStep: 0
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this.#translationService = TranslationService;
		this.#escKeyListener = (e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeModal();
			}
		};
	}

	onInitialize() {
		this.observe(
			(state) => state.modal,
			(modal) => this.signal(Update_Modal_Data, modal)
		);
		this.observe(
			(state) => state.media.portrait,
			(portrait) => this.signal(Update_IsPortrait_Value, portrait)
		);

		this.observeModel('active', (active) => {
			if (active) {
				document.addEventListener('keydown', this.#escKeyListener);
				setTimeout(() => {
					//focus the first element containing the autofocus attribute
					findAllBySelector(this, '*[autofocus]')[0]?.focus();
				});
			} else {
				this.#removeKeyDownListener();
			}
		});
	}
	#removeKeyDownListener() {
		document.removeEventListener('keydown', this.#escKeyListener);
	}

	onDisconnect() {
		this.#removeKeyDownListener();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Modal_Data:
				return { ...model, data: data.data, active: data.active, currentStep: data.currentStep };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { active, portrait, currentStep } = model;
		const translate = (key) => this.#translationService.translate(key);

		const hide = (force) => {
			if (currentStep === 0 || force) {
				const elementModal = this.shadowRoot.querySelector('.modal__container');
				elementModal.classList.remove('modal_show');
				elementModal.classList.add('modal_hide');
				elementModal.addEventListener('animationend', () => {
					closeModal();
				});
			} else {
				decrementStep();
			}
		};

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		if (active) {
			const {
				data: { title, content }
			} = model;
			return html`
				<style>
					${css}
				</style>
				<div class="modal__container modal_show ${getOrientationClass()}">
					<div class="modal ">
						<div class="modal__title">
							<span class="ba-list-item__pre back-icon" @click="${() => hide()}">
								<ba-icon id="back_button" data-test-id .icon="${arrowLeftShort}" .color=${'var(--primary-color)'} .size=${4}></ba-icon>
							</span>
							<span class="modal__title-text">${title}</span>
						</div>
						<div class="modal__content">${content}</div>
						<div class="modal__actions">
							<ba-button id="close_button" data-test-id .label=${translate('modal_close_button')} @click=${hide}></ba-button>
						</div>
					</div>
				</div>
				<div class="modal__background" @click="${() => hide(true)}"></div>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-modal';
	}
}
