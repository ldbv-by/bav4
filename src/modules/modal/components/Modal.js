import { html, nothing } from 'lit-html';
import { BaElement } from '../../BaElement';
import css from './modal.css';
import { $injector } from '../../../injection';
import { closeModal } from '../../../store/modal/modal.action';
import arrowLeftShort from '../assets/arrowLeftShort.svg';

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
		const { active, portrait } = state;
		const translate = (key) => this._translationService.translate(key);

		const hide = () => {
			const elementModal = this.shadowRoot.querySelector('.modal__container');
			elementModal.classList.remove('modal_show');
			elementModal.classList.add('modal_hide');
			elementModal.addEventListener('animationend', () => {
				closeModal();
			});
		};

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		if (active) {
			const { data: { title, content } } = state;
			return html`
        		<style>${css}</style>
				<div class='modal__container modal_show ${getOrientationClass()}'>
					<div class='modal '>
						<div class='modal__title' @click="${hide}">
							<span class="ba-list-item__pre back-icon" >
								<ba-icon  .icon='${arrowLeftShort}' .color=${'var(--primary-color)'} .size=${4}  ></ba-icon>                    							 
							</span>	
							<span class='modal__title-text'>${title}</span>
						</div>
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
		const { modal: { data, active }, media: { portrait } } = globalState;
		return { data, active, portrait };
	}

	static get tag() {
		return 'ba-modal';
	}
}
