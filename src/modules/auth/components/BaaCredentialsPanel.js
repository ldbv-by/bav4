import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import css from './baacredentialspanel.css';

const Update_ID = 'update_id';
const Update_IsPortrait_Value = 'update_isportrait_value';

export class BaaCredentialsPanel extends MvuElement {
	constructor() {
		super({
			id: null,
			credentials: null
		});


		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onInput = () => false;
	}

	onInitialize() {
		this.observe(state => state.media.portrait, portrait => this.signal(Update_IsPortrait_Value, portrait));
	}

	update(type, data, model) {

		switch (type) {
			case Update_ID:
				return { ...model, id: data };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { portrait, id } = model;
		const translate = (key) => this._translationService.translate(key);
		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		return html`
		<style>${css}</style>
		<div class='credentials__container ${getOrientationClass()}'>
			<div class='credentials_header'>
            <span class='tile_id'>${translate('auth_baaCredentialsPanel_title')}</span>
            <span class='value_id'>${id}</span>
            </div>
            <div class='credentials_form'>
            <div class="fieldset" title="${translate('auth_baaCredentialsPanel_username')}"">								
            <input required="required"  type="text" id="credentials_username" name="${translate('auth_baaCredentialsPanel_credentials_username')}" >
            <label for="credentials_username" class="control-label">${translate('auth_baaCredentialsPanel_credentials_username')}</label><i class="bar"></i>
            <input required="required"  type="password" id="credentials_password" name="${translate('auth_baaCredentialsPanel_credentials_username')}" @input=${this.onInput}>
            <label for="credentials_username" class="control-label">${translate('auth_baaCredentialsPanel_credentials_username')}</label><i class="bar"></i>
        </div>
            </div>
		</div>
		`;
	}

	static get tag() {
		return 'ba-auth-baa-credentials-panel';
	}

	set id(value) {
		this.signal(Update_ID, value);
	}

	get id() {
		return this.getModel().id;
	}

	set onInput(callback) {
		this._onInput = callback;
	}

	get onInput() {
		return this._onInput;
	}
}
