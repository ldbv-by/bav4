import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import css from './baacredentialspanel.css';

const Update_ID = 'update_id';
const Update_Username = 'update_username';
const Update_Password = 'update_password';
const Update_Credential_Status = 'update_credential_status';
const Update_IsPortrait_Value = 'update_isportrait_value';


export const CredentialStatusTypes = Object.freeze({
	UNKNOWN: 'unknown',
	RESOLVED: 'resolved',
	REJECTED: 'rejected'
});

export class BaaCredentialsPanel extends MvuElement {
	constructor() {
		super({
			id: null,
			credentials: { username: null, password: null },
			status: CredentialStatusTypes.UNKNOWN
		});


		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onCheck = () => false;
	}

	onInitialize() {
		this.observe(state => state.media.portrait, portrait => this.signal(Update_IsPortrait_Value, portrait));
	}

	update(type, data, model) {

		switch (type) {
			case Update_ID:
				return { ...model, id: data };
			case Update_Username:
				return { ...model, credentials: { ...model.credentials, username: data } };
			case Update_Password:
				return { ...model, credentials: { ...model.credentials, password: data } };
			case Update_Credential_Status:
				return { ...model, status: data };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { portrait, id, credentials } = model;
		const translate = (key) => this._translationService.translate(key);
		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const onChangeUserName = (e) => {
			this.signal(Update_Username, e.target.value);
		};

		const onChangePassword = (e) => {
			this.signal(Update_Username, e.target.value);
		};

		const checkCredentials = async () => {
			const credentialCheck = await this._onCheck(id, credentials);
			this.signal(Update_Credential_Status, credentialCheck ? CredentialStatusTypes.RESOLVED : CredentialStatusTypes.REJECTED);
		};

		return html`
		<style>${css}</style>
		<div class='credentials__container ${getOrientationClass()}'>
			<div class='credentials_header'>
            	<span class='tile_id'>${translate('auth_baaCredentialsPanel_title')}</span>
            	<span class='value_id'>${id}</span>
            </div>
            <div class='credentials_form'>
				<div class="fieldset" title="${translate('auth_baaCredentialsPanel_username')}">								
					<input required="required"  type="text" id="credentials_username" placeholder="${translate('auth_baaCredentialsPanel_credentials_password')}" @input=${onChangeUserName} >
					<label for="credentials_username" class="control-label">${translate('auth_baaCredentialsPanel_credentials_username')}</label><i class="bar"></i>
				</div>
				<div class="fieldset" title="${translate('auth_baaCredentialsPanel_password')}"">								
					<input required="required"  type="password" id="credentials_password" placeholder="${translate('auth_baaCredentialsPanel_credentials_password')}" @input=${onChangePassword}>
					<label for="credentials_password" class="control-label">${translate('auth_baaCredentialsPanel_credentials_password')}</label><i class="bar"></i>
				</div>
			</div>
			<div class='credentials_footer'>
				<button id='check-credentials-button'
                class="credentials_footer__button" 
                title="${translate('auth_baaCredentialsPanel_submit')}"
                @click=${checkCredentials}>
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

	set onCheck(callback) {
		this._onCheck = callback;
	}

	get onCheck() {
		return this._onCheck;
	}
}
