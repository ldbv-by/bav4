/**
 * @module modules/admin/components/AdminCatalogConfirmActionPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';

/**
 * Executes a callback function on submit.
 * @property {Function} onSubmit Initially registers a callback function which will be called when the confirm button was pressed
 * @property {string} topicId The topic id to publish to
 * @class
 * @author herrmutig
 */
export class AdminCatalogConfirmActionPanel extends MvuElement {
	constructor() {
		super({});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onSubmit = () => {};
	}

	/**
	 *@override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const onFormSubmit = () => {
			this._onSubmit();
		};

		return html`
			<div>
				<div class="ba-form-element">
					<ba-button
						id="confirm-button"
						.type=${'primary'}
						.label=${translate('admin_modal_button_confirm')}
						@click=${() => onFormSubmit()}
					></ba-button>
				</div>
			</div>
		`;
	}

	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	static get tag() {
		return 'ba-admin-catalog-confirm-action-panel';
	}
}
