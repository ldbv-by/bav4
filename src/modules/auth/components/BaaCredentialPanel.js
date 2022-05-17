import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { MvuElement } from '../../MvuElement';
import css from './baacredentialpanel.css';

const Update_ID = 'update_id';
const Update_Username = 'update_username';
const Update_Password = 'update_password';
const Update_IsPortrait_Value = 'update_isportrait_value';
const Update_Check_Is_Running = 'update_check_is_running';
const Update_Add_Subscription = 'update_add_subscription';

const Empty_Credential = { username: null, password: null };

/**
 * @typedef Credential
 * @property {string} username the username
 * @property {string} password the password
 */

/**
 * This callback provides the implementation of the authentication of id and credential.
 * @callback BaaCredentialPanel~onCheckCallback
 * @param {string} id
 * @param {Credential} credential
 * @returns {true|false} whether or not the check with the id and the credential was succesfull
 */

/**
 * This callback is called after the authentication was successful or the panel was closed.
 * @callback BaaCredentialPanel~onResolvedCallback
  * @param {Credential|null} credential the valid credential or null, if the authentication was aborted.
 */

/**
 * Panel to enter credential for basic access authentication.
 *
 * usage:
 *  <pre>
 * const restrictedId = 'https://my.restricted.id/for/wms';
 * const receivedCredential = {};
 *
 * // the check-callback provides the implementation of the authentication of id and credential
 * const onCheck = async (id, credential) => {
 *    await sleep(3000);
 *    if (id === restrictedId && credential?.username === 'foo' && credential?.password === 'bar') {
 *       receivedCredential.username = credential.username;
 *       receivedCredential.password = credential.password;
 *       return true;
 *    }
 *    return false;
 * };
 *
 * // resolved-callback is called with valid a credential or NULL
 * const onResolved = (credential) => {
 *    const resolveAction = credential ? closeModal : () => emitNotification('Authentication aborted', LevelTypes.WARN);
 *    resolveAction();
 * };
 *
 * // create a BaaCredentialPanel-element within a templateResult
 * const getCredentialPanel = () => {
 * 	  return html`&lt;ba-auth-baa-credential-panel .id=${restrictedId} .onCheck=${onCheck} .onResolved=${onResolved}&gt;`;
 * };
 *
 * // using the panel as content for the modal
 * openModal('Connect with restricted WMS...', getCredentialPanel());
 * </pre>
 * @class
 * @property {string} id the id, which needs credential for basic access authentication
 * @property {BaaCredentialPanel~onCheckCallback} onCheck the onCheck callback
 * @property {BaaCredentialPanel~onResolvedCallback} onResolved the onResolved callback
 * @author thiloSchlemmer
 */
export class BaaCredentialPanel extends MvuElement {
	constructor() {
		super({
			id: null,
			credential: Empty_Credential,
			checkIsRunning: false,
			subscription: null
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onCheck = () => false;
		this._onResolved = () => { };
	}

	onInitialize() {
		this.observe(state => state.media.portrait, portrait => this.signal(Update_IsPortrait_Value, portrait));
		const subscription = this.observe(state => state.modal, modal => this._resolveBeforeClosing(modal), false);
		this.signal(Update_Add_Subscription, subscription);
	}

	update(type, data, model) {

		switch (type) {
			case Update_ID:
				return { ...model, id: data };
			case Update_Username:
				return { ...model, credential: { ...model.credential, username: data } };
			case Update_Password:
				return { ...model, credential: { ...model.credential, password: data } };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
			case Update_Add_Subscription:
				return { ...model, subscription: data };
			case Update_Check_Is_Running:
				return { ...model, checkIsRunning: data };
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

		const onChangeUserName = (e) => {
			this.signal(Update_Username, e.target.value);
		};

		const onChangePassword = (e) => {
			this.signal(Update_Password, e.target.value);
		};

		return html`
		<style>${css}</style>
		<div class='credential__container ${getOrientationClass()}'>
			<div class='credential_header'>
            	<span class='title_id'>${translate('auth_baaCredentialPanel_title')}</span>
            	<span class='value_id'>${id}</span>
            </div>
            <div class='credential_form'>
				<div class="fieldset" title="${translate('auth_baaCredentialPanel_credential_username')}">								
					<input required="required"  type="text" id="credential_username"  @input=${onChangeUserName} >
					<label for="credential_username" class="control-label">${translate('auth_baaCredentialPanel_credential_username')}</label><i class="bar"></i>
				</div>
				<div class="fieldset" title="${translate('auth_baaCredentialPanel_credential_password')}"">								
					<input required="required"  type="password" id="credential_password"  @input=${onChangePassword}>
					<label for="credential_password" class="control-label">${translate('auth_baaCredentialPanel_credential_password')}</label><i class="bar"></i>
				</div>
			</div>
			<div class='credential_footer'>
			${this._getSubmitOrSpinner(model)}
            </div>
		</div>
		`;
	}

	_getSubmitOrSpinner(model) {
		const { id, credential, checkIsRunning } = model;
		const translate = (key) => this._translationService.translate(key);

		const getSubmitButton = () => {
			const checkCredential = async () => {
				this.signal(Update_Check_Is_Running, true);
				const isValid = await this.onCheck(id, credential);
				if (isValid) {
					this._unsubscribe();
					this.onResolved(credential);
				}
				else {
					emitNotification(translate('auth_baaCredentialPanel_credential_rejected'), LevelTypes.WARN);
				}
				this.signal(Update_Check_Is_Running, false);
			};
			return html`<ba-button id='check-credential-button'
			class="credential_footer__button" .label=${translate('auth_baaCredentialPanel_submit')} .type=${'primary'}                
			@click=${checkCredential} ></ba-button>`;
		};

		const getSpinnerButton = () => {
			return html`<ba-button id='check-spinner-button' .disabled=${true}
			class="credential_footer__button" .label=${translate('auth_baaCredentialPanel_authenticate')} .type=${'primary'}              
			></ba-button>`;
		};
		return checkIsRunning ? getSpinnerButton() : getSubmitButton();

	}

	_resolveBeforeClosing(modal) {
		if (!modal.data) {
			this._unsubscribe();
			this.onResolved(null);
		}
	}

	_unsubscribe() {
		const { subscription: unsubscribe } = this.getModel();
		unsubscribe();
	}

	static get tag() {
		return 'ba-auth-baa-credential-panel';
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

	set onResolved(callback) {
		this._onResolved = callback;
	}

	get onResolved() {
		return this._onResolved;
	}
}
