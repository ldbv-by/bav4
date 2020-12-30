import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { closeModal } from '../store/modal.action';
import css from './modal.css';
import { $injector } from '../../../injection';

/**
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
		let classes = 'modal';

		if (visible) {
			classes = classes + ' modal--active';
		}
		return html`
        		<style>${css}</style>
				<div class='${classes}'>
					<div class='modal-content'>
						<div class='modal-header'>
							<h4  class='modal-title'>${title}</h4>
						</div>
						<div class='modal-body'>${content}</div>
						<div class='modal-footer'>
						<ba-button id='modalclose' label='${translate('modal_close_button')}' @click='${close()}'></ba-button>
						</div>
					</div>
    			</div>`;
	}	

	/**
	 * @override
	 */
	onWindowLoad() {
		// register callback on ba-button element
		this._root.getElementById('modalclose').onClick = () => closeModal();
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