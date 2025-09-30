/**
 * @module modules/admin/components/AdminCatalogBranchPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';

/**
 * Submits a form to handle branch editing
 * @property {Function} onSubmit Initially registers a callback function which will be called when the confirm button was pressed
 * @property {String} id The branch id to edit
 * @property {String} label The label of the branch
 * @class
 * @author herrmutig
 */
export class AdminCatalogBranchPanel extends MvuElement {
	constructor() {
		super({});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._id = '';
		this._label = '';
		// eslint-disable-next-line no-unused-vars
		this._onSubmit = (id, label) => {};
	}

	/**
	 *@override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const onLabelInput = (evt) => {
			this._label = evt.target.value;
		};

		const onFormSubmit = () => {
			this._onSubmit(this._id, this._label);
		};

		return html` <div>
			<div class="ba-form-element">
				<input id="branch-input" @input=${onLabelInput} value=${this._label} />
				<label for="branch-input" class="control-label">${translate('admin_modal_branch_label')}</label>
				<label class="error-label">${translate('admin_required_field_error')}</label>
			</div>
			<div class="ba-form-element">
				<ba-button
					id="confirm-button"
					.type=${'primary'}
					.label=${translate('admin_modal_button_confirm')}
					@click=${() => onFormSubmit()}
				></ba-button>
			</div>
		</div>`;
	}

	set id(value) {
		this._id = value;
	}

	set label(value) {
		this._label = value;
	}

	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	static get tag() {
		return 'ba-admin-catalog-branch-panel';
	}
}
