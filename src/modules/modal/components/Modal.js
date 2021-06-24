import { html, nothing } from 'lit-html';
import { BaElement } from '../../BaElement';
import { closeModal } from '../store/modal.action';
import css from './modal.css';
import { $injector } from '../../../injection';

/**
 * Global modal window element, to show information, which the user must interact with.
 * @class
 * @author thiloSchlemmer
 * @author alsturm
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
		const { title, content, visible } = state;
		const translate = (key) => this._translationService.translate(key);

		if (visible) {
			return html`
        		<style>${css}</style>
				<div class='modal' @click="${closeModal}">
    			</div>
				<div class='test  is-active'>
					<div class='modal__content'>
						<div class='modal__header'>${title}</div>
						<div class='modal__body'>${content}</div>
						<div class='modal__footer'>
						<ba-button id='modalclose' label='${translate('modal_close_button')}' @click='${closeModal}'></ba-button>
						</div>
					</div>
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
		const { modal: { title, content } } = globalState;
		const visible = content;
		return { title, content, visible };
	}

	static get tag() {
		return 'ba-modal';
	}

}