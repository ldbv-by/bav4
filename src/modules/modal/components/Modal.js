import { html, nothing } from 'lit-html';
import css from './modal.css';
import { $injector } from '../../../injection';
import { closeModal } from '../../../store/modal/modal.action';
import arrowLeftShort from '../assets/arrowLeftShort.svg';
import { MvuElement } from '../../MvuElement';

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

	constructor() {
		super({
			data: null,
			active: false,
			portrait: true
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		this.observe(state => state.modal, modal => this.signal(Update_Modal_Data, modal));
		this.observe(state => state.media.portrait, portrait => this.signal(Update_IsPortrait_Value, portrait));
	}

	update(type, data, model) {

		switch (type) {
			case Update_Modal_Data:
				return { ...model, data: data.data, active: data.active };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { active, portrait } = model;
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
			const { data: { title, content } } = model;
			return html`
        		<style>${css}</style>
				<div class='modal__container modal_show ${getOrientationClass()}'>
					<div class='modal '>
						<div class='modal__title' @click="${hide}">
							<span class="ba-list-item__pre back-icon" >
								<ba-icon id='back_button' data-test-id .icon='${arrowLeftShort}' .color=${'var(--primary-color)'} .size=${4}  ></ba-icon>                    							 
							</span>	
							<span class='modal__title-text'>${title}</span>
						</div>
						<div class='modal__content'>${content}</div>
						<div class='modal__actions'>
							<ba-button id='close_button' data-test-id .label=${translate('modal_close_button')} @click=${hide}></ba-button>
						</div>
					</div>
				</div>
				<div class='modal__background' @click="${hide}">
    			</div>
				`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-modal';
	}
}
