import { html, nothing } from 'lit-html';
import { BaElement } from '../../BaElement';
import { closeModal } from '../store/modal.action';
import css from './modal.css';
import { $injector } from '../../../injection';

/**
 * Modal dialog container.
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 * @author taulinger
 */
export class Modal extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 * @override
	 */
	createView(state) {
		const { active } = state;
		const translate = (key) => this._translationService.translate(key);

		const hide = () => {
			const elementModal = this.shadowRoot.querySelector('.modal__container');
			elementModal.classList.remove('modal_show');
			elementModal.classList.add('modal_hide');
			elementModal.addEventListener('animationend', () => {
				closeModal();
			});
		};

		if (active) {
			const { data: { title, content } } = state;
			return html`
        		<style>${css}</style>
				<div class='modal__container modal_show'>
					<div class='modal '>
						<div class='modal__title'>${title}</div>
						<div class='modal__content'>${content}</div>
						<div class='modal__actions'>
							<ba-button .label=${translate('modal_close_button')} @click=${hide}></ba-button>
						</div>
					</div>
				</div>
				<div class='modal__background' @click="${hide}">
    			</div>
				`;
		}
		return nothing;
	}

	/**
	 * @override
	 * @param {Object} globalState
	 */
	extractState(globalState) {
		const { modal: { data, active } } = globalState;
		return { data, active };
	}

	static get tag() {
		return 'ba-modal';
	}
}
