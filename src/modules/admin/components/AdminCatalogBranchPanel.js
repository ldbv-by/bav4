/**
 * @module modules/admin/components/AdminCatalogBranchPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';

const Update_Label = 'update_label';

/**
 * @class
 * @author herrmutig
 */
export class AdminCatalogBranchPanel extends MvuElement {
	constructor() {
		super({
			label: ''
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Label:
				return { ...model, label: data ?? '' };
		}
	}

	/**
	 *@override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const onLabelInput = (evt) => {
			this.signal(Update_Label, evt.currentTarget.value);
		};

		const onConfirm = () => {
			this.dispatchEvent(new CustomEvent('confirm'));
		};

		return html` <div>
			<div class="ba-form-element">
				<input class="popup-input" type="text" @input=${onLabelInput} value=${this.label} />
				<label for="editor" class="control-label">${translate('admin_modal_branch_label')}</label>
				<label class="error-label">${translate('admin_required_field_error')}</label>
			</div>
			<div class="ba-form-element">
				<ba-button id="btn_confirm" .type=${'primary'} .label=${translate('admin_modal_button_confirm')} @click=${() => onConfirm()}></ba-button>
			</div>
		</div>`;
	}

	set label(label) {
		this.signal(Update_Label, label);
	}

	get label() {
		return this.getModel().label;
	}

	static get tag() {
		return 'ba-admin-catalog-branch-panel';
	}
}
