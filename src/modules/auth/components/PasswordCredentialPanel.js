/**
 * @module modules/auth/components/PasswordCredentialPanel
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { MvuElement } from '../../MvuElement';
import css from './passwordcredentialpanel.css';

const Update_URL = 'update_url';
const Update_Username = 'update_username';
const Update_Password = 'update_password';
const Update_Show_Password = 'update_show_password';
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
 * @returns {Object| null} whether or not the check with the id and the credential was successful an object is returned or null.
 */

/**
 * This callback is called after the authentication was successful.
 * @callback PasswordCredentialPanel~onCloseCallback
 * @param {Credential} credential the valid credential.
 * @param {Object} result the authentication-result.
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
 *       return { message: 'Credential is valid' };
 *    }
 *    return null;
 * };
 *
 * // in case of aborting the authentication-process by closing the modal,
 * // call the onCloseCallback directly
 * const resolveBeforeClosing = (modal) => {
 *       if (!modal.active) {
 *          unsubscribe();
 *          onClose(null);
 *       }
 *    };
 *
 * // valid subscription for all MvuElement-Instances; BaElement-Instances may use storeUtils/observe
 * const unsubscribe = this.observe(state => state.modal, modal => resolveBeforeClosing(modal), false);
 *
 * // onClose-callback is called with a valid credential or NULL
 * const onClose = (credential, result) => {
 *       unsubscribe();
 *       const succeed = () => {
 *          emitNotification(result.message, LevelTypes.INFO);
 *          closeModal();
 *          };
 *       const abort = () => {
 *          emitNotification('Authentication aborted', LevelTypes.WARN);
 *       };
 *       const resolveAction = credential ? succeed : abort;
 *       resolveAction();
 *    };
 *
 * // creates a PasswordCredentialPanel-element within a templateResult
 * const getCredentialPanel = () => {
 * 	  return html`&lt;ba-auth-password-credential-panel .url=${restrictedUrl} .authenticate=${authenticate} .onClose=${onClose}&gt;`;
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
			authenticating: false,
			showPassword: false
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._authenticate = () => false;
		this._onClose = () => {};
	}

	onInitialize() {
		this.observe(
			(state) => state.media.portrait,
			(portrait) => this.signal(Update_IsPortrait_Value, portrait)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_URL:
				return { ...model, url: data };
			case Update_Username:
				return { ...model, credential: { ...model.credential, username: data } };
			case Update_Password:
				return { ...model, credential: { ...model.credential, password: data } };
			case Update_Show_Password:
				return { ...model, showPassword: data };
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
		const { portrait, url, credential, showPassword } = model;
		const translate = (key) => this._translationService.translate(key);
		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const passwordClasses = {
			eye: showPassword
		};

		const onChangeUserName = (e) => {
			this.signal(Update_Username, e.target.value);
		};

		const onChangePassword = (e) => {
			this.signal(Update_Password, e.target.value);
		};

		const onEnterAuthenticate = (e) => {
			const no_op = () => {};
			const authenticate = () => {
				this._tryAuthenticate(credential, url);
			};
			const keyAction = e.key === 'Enter' ? authenticate : no_op;
			keyAction();
		};

		const getHeaderContent = (url) => {
			return url
				? html`<span class="title_url">${translate('auth_passwordCredentialPanel_title')}</span><span class="value_url" title=${url}>${url}</span>`
				: nothing;
		};

		const togglePassword = () => {
			this.signal(Update_Show_Password, !showPassword);
		};

		return html`
		<style>${css}</style>
		<div class='credential_container ${getOrientationClass()}'>
		<div class='credential_form'>
				<div class='credential_header'>
					${getHeaderContent(url)}
				</div>
				<div class="ba-form-element" title="${translate('auth_passwordCredentialPanel_credential_username')}">								
					<input autofocus  placeholder='${translate(
						'auth_passwordCredentialPanel_credential_username'
					)}' type="text" id="credential_username"  @input=${onChangeUserName} @keydown=${onEnterAuthenticate} >
					<label for="credential_username" class="control-label">${translate('auth_passwordCredentialPanel_credential_username')}</label><i class="bar"></i>
				</div>
				<div class="ba-form-element" title="${translate('auth_passwordCredentialPanel_credential_password')}"">								
					<input placeholder='${translate('auth_passwordCredentialPanel_credential_password')}'  type=${
						showPassword ? 'text' : 'password'
					} id="credential_password"  @input=${onChangePassword} @keydown=${onEnterAuthenticate} >
					<label for="credential_password" class="control-label">${translate('auth_passwordCredentialPanel_credential_password')}</label><i class="bar"></i>
					<i class="eye-slash ${classMap(passwordClasses)}" id="toggle_password" @click=${togglePassword} ></i>
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
			const authenticate = () => this._tryAuthenticate(credential, url);
			return html`<ba-button
				id="authenticate-credential-button"
				class="credential_footer__button"
				.label=${translate('auth_passwordCredentialPanel_submit')}
				.type=${'primary'}
				@click=${authenticate}
			></ba-button>`;
		};

		const getSpinnerButton = () => {
			return html`<ba-button
				id="authenticating-button"
				class="credential_footer__button"
				.disabled=${true}
				.label=${translate('auth_passwordCredentialPanel_authenticate')}
				.type=${'loading'}
			></ba-button>`;
		};
		return authenticating ? getSpinnerButton() : getSubmitButton();
	}

	async _tryAuthenticate(credential, url) {
		const translate = (key) => this._translationService.translate(key);
		this.signal(Update_Authenticating, true);
		try {
			const result = await this._authenticate(credential, url);
			if (result) {
				this._onClose(credential, result);
			} else {
				emitNotification(translate('auth_passwordCredentialPanel_credential_failed'), LevelTypes.WARN);
			}
		} catch (e) {
			console.error(e);
			emitNotification(translate('auth_passwordCredentialPanel_credential_rejected'), LevelTypes.ERROR);
		}
		this.signal(Update_Authenticating, false);
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
