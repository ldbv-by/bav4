import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { MvuElement } from '../../MvuElement';
import css from './passwordcredentialpanel.css';

const Update_URL = 'update_url';
const Update_Username = 'update_username';
const Update_Password = 'update_password';
const Update_IsPortrait_Value = 'update_isportrait_value';
const Update_Authenticating = 'update_authenticating';

/**
 * @typedef Credential
 * @property {string} username the username
 * @property {string} password the password
 */

/**
 * This callback provides the implementation of the authentication of id and credential.
 * @callback PasswordCredentialPanel~authenticateCallback
 * @param {Credential} credential the credential
 * @param {string} [url] the optional url
 * @returns {true|false} whether or not the check with the id and the credential was succesfull
 */

/**
 * This callback is called after the authentication was successful.
 * @callback PasswordCredentialPanel~onCloseCallback
  * @param {Credential} credential the valid credential.
 */

/**
 * Panel to enter credential for basic access authentication.
 *
 * usage:
 * <pre>
 * const restrictedUrl = 'https://my.restricted.url/for/wms';
 * const receivedCredential = {};
 *
 * // the authenticate-callback provides the implementation of the authentication of credential and url
 * const authenticate = async (credential, url) => {
 *    await sleep(3000);
 *    if (url === restrictedUrl && credential?.username === 'foo' && credential?.password === 'bar') {
 *       receivedCredential.username = credential.username;
 *       receivedCredential.password = credential.password;
 *       return true;
 *    }
 *    return false;
 * };
 *
 * // in case of aborting the authentification-process by closing the modal,
 * // call the onCloseCallback directly
 * const resolveBeforeClosing = (modal) => {
 *       if (!modal.data) {
 *          unsubscribe();
 *          onClose(null);
 *       }
 *    };
 *
 * const unsubscribe = this.observe(state => state.modal, modal => resolveBeforeClosing(modal), false);
 *
 * // onClose-callback is called with a valid credential or NULL
 * const onClose = (credential) => {
 *    unsubscribe();
 *    const resolveAction = credential ? closeModal : () => emitNotification('Authentication aborted', LevelTypes.WARN);
 *    resolveAction();
 * };
 *
 * // creates a PasswordCredentialPanel-element within a templateResult
 * const getCredentialPanel = () => {
 * 	  return html`&lt;ba-auth-password-credential-panel .url=${restrictedId} .authenticate=${authenticate} .onClose=${onClose}&gt;`;
 * };
 *
 * // using the panel as content for the modal
 * openModal('Connect with restricted WMS...', getCredentialPanel());
 * </pre>
 * @class
 * @property {string} [url] the url, which needs authentication by a password credential
 * @property {PasswordCredentialPanel~authenticateCallback} [authenticate] the authenticate callback
 * @property {PasswordCredentialPanel~onCloseCallback} [onClose] the onClose callback
 * @author thiloSchlemmer
 */
export class PasswordCredentialPanel extends MvuElement {
	constructor() {
		super({
			url: null,
			credential: null,
			authenticating: false
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._authenticate = () => false;
		this._onClose = () => { };
	}

	onInitialize() {
		this.observe(state => state.media.portrait, portrait => this.signal(Update_IsPortrait_Value, portrait));
	}

	update(type, data, model) {

		switch (type) {
			case Update_URL:
				return { ...model, url: data };
			case Update_Username:
				return { ...model, credential: { ...model.credential, username: data } };
			case Update_Password:
				return { ...model, credential: { ...model.credential, password: data } };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
			case Update_Authenticating:
				return { ...model, authenticating: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { portrait, url } = model;
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

		const getHeaderContent = (url) => {
			return url ? html`<span class='title_url'>${translate('auth_passwordCredentialPanel_title')}</span><span class='value_url'>${url}</span>` : nothing;
		};

		return html`
		<style>${css}</style>
		<div class='credential__container ${getOrientationClass()}'>
			<div class='credential_header'>
            	${getHeaderContent(url)}
            </div>
            <div class='credential_form'>
				<div class="fieldset" title="${translate('auth_passwordCredentialPanel_credential_username')}">								
					<input required="required"  type="text" id="credential_username"  @input=${onChangeUserName} >
					<label for="credential_username" class="control-label">${translate('auth_passwordCredentialPanel_credential_username')}</label><i class="bar"></i>
				</div>
				<div class="fieldset" title="${translate('auth_passwordCredentialPanel_credential_password')}"">								
					<input required="required"  type="password" id="credential_password"  @input=${onChangePassword}>
					<label for="credential_password" class="control-label">${translate('auth_passwordCredentialPanel_credential_password')}</label><i class="bar"></i>
				</div>
			</div>
			<div class='credential_footer'>
			${this._getSubmitOrSpinner(model)}
            </div>
		</div>
		`;
	}

	_getSubmitOrSpinner(model) {
		const { url, credential, authenticating } = model;
		const translate = (key) => this._translationService.translate(key);

		const getSubmitButton = () => {
			const authenticate = async () => {
				this.signal(Update_Authenticating, true);
				const isValid = await this._authenticate(credential, url);
				if (isValid) {
					this._onClose(credential);
				}
				else {
					emitNotification(translate('auth_passwordCredentialPanel_credential_rejected'), LevelTypes.WARN);
				}
				this.signal(Update_Authenticating, false);
			};
			return html`<ba-button id='authenticate-credential-button'
			class="credential_footer__button" .label=${translate('auth_passwordCredentialPanel_submit')} .type=${'primary'}                
			@click=${authenticate} ></ba-button>`;
		};

		const getSpinnerButton = () => {
			// TODO: if spinner-component supports a label property in future, then
			// this should be changed from:
			// .label=${html`<ba-spinner>`}
			// to:
			// .label=${html`<ba-spinner .label=${translate('auth_passwordCredentialPanel_authenticate')}>`}
			return html`<ba-button id='authenticating-button' .disabled=${true}
			class="credential_footer__button" .label=${html`<ba-spinner>`} .type=${'primary'}              
			></ba-button>`;
		};
		return authenticating ? getSpinnerButton() : getSubmitButton();

	}

	static get tag() {
		return 'ba-auth-password-credential-panel';
	}

	set url(value) {
		this.signal(Update_URL, value);
	}

	get url() {
		return this.getModel().url;
	}

	set authenticate(callback) {
		this._authenticate = callback;
	}

	set onClose(callback) {
		this._onClose = callback;
	}
}
