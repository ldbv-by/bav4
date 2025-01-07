/**
 * @module modules/commons/components/spinner/Spinner
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { MvuElement } from '../../../MvuElement';
import css from './spinner.css';

const Update_Label = 'update_label';

/**
 * Properties:
 * - `label`
 *
 * @class
 * @author taulinger
 * @author thiloSchlemmer
 */
export class Spinner extends MvuElement {
	constructor() {
		super({
			label: null
		});
		const { TranslationService: translationService } = $injector.inject('TranslationService');

		this._translationService = translationService;
	}

	onInitialize() {
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	update(type, data, model) {
		switch (type) {
			case Update_Label:
				return { ...model, label: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { label } = model;
		const translate = (key) => this._translationService.translate(key);

		const currentLabel = label ? label : translate('commons_spinner_text');

		return html`
			<style>
				${css}
			</style>
			<span class="loading">${currentLabel}</span>
		`;
	}

	static get tag() {
		return 'ba-spinner';
	}

	/**
	 * @property {string} label='' - Label of the button
	 */
	set label(value) {
		this.signal(Update_Label, value);
	}

	get label() {
		return this.getModel().label;
	}
}
