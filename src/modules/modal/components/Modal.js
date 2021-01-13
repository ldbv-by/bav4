import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { closeModal } from '../store/modal.action';
import css from './modal.css';
import { $injector } from '../../../injection';

/**
 * Global modal window element, to show information, which the user must interact with.
 * @class
 * @author thiloSchlemmer
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
	createView() {
		const { title, content, visible } = this._state;
		const translate = (key) => this._translationService.translate(key);

		if (visible) {
			return html`
        		<style>${css}</style>
				<div class='modal modal--active'>
					<div class='modal-content'>
						<div class='modal-header'>
							<h4  class='modal-title'>${title}</h4>
						</div>
						<div class='modal-body'>${content}</div>
						<div class='modal-footer'>
						<ba-button id='modalclose' label='${translate('modal_close_button')}' @click='${closeModal}'></ba-button>
						</div>
					</div>
    			</div>`;
		}	
		return html``;	
	}	

	
	/**
 * @override
 * @param {Object} store 
 */
	extractState(store) {
		const { modal: { title, content } } = store;
		const visible = content;
		return { title, content, visible };
	}

	static get tag() {
		return 'ba-modal';
	}

}