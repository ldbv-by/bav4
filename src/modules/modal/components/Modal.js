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

		if (active) {
			const { data: { title, content } } = state;
			return html`
        		<style>${css}</style>
				<div class='modal__background' @click="${closeModal}">
    			</div>
				<div class='modal__container'>
					<div class='modal'>
						<div class='modal__title'>${title}</div>
						<div class='modal__content'>${content}</div>
						<div class='modal__actions'>
							<ba-button  label='${translate('modal_close_button')}' @click='${closeModal}'></ba-button>
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
		const { modal: { data, active } } = globalState;
		return { data, active };
	}

	static get tag() {
		return 'ba-modal';
	}
}
