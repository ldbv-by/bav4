import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { MvuElement } from '../../MvuElement';
import css from './baacredentialspanel.css';

const Update_ID = 'update_id';
const Update_Username = 'update_username';
const Update_Password = 'update_password';
const Update_IsPortrait_Value = 'update_isportrait_value';
const Update_Check_Is_Running = 'update_check_is_running';

const Empty_Credentials = { username: null, password: null };

/**
 * @typedef Credentials
 * @property {string} username the username
 * @property {string} password the password
 */

/**
 * This callback provides the implementation of the authentication of id and credentials.
 * @callback BaaCredentialsPanel~onCheckCallback
 * @param {string} id
 * @param {Credentials} credentials
 * @returns {true|false} whether or not the check with the id and the credentials was succesfull
 */

/**
 * This callback is called after the authentication was successful or the panel was closed.
 * @callback BaaCredentialsPanel~onResolvedCallback
  * @param {Credentials|null} credentials the valid credentials or null, if the authentication was aborted.
 */

/**
 * Panel to enter credentials for basic access authentication.
 *
 * usage:
 *  <pre>
 *  const securedId = 'https://my.secure.id/for/wms';
 *
 *  // the check-callback provides the implementation of the authentication of id and credentials
 * 	const onCheck = async (id, credentials) => {
 * 		await sleep(3000);
 * 		if (id === securedId && credentials?.username === 'foo' && credentials?.password === 'bar') {
 * 			receivedCredentials.username = credentials.username;
 * 			receivedCredentials.password = credentials.password;
 * 			return true;
 * 		}
 * 		return false;
 *	};
 *
 *  // resolved-callback is called with valid credentials or NULL
 *	const onResolved = (credentials) => {
 *		if (credentials) {
 *			closeModal();
 *		}
 * 		emitNotification('Authentication aborted', LevelTypes.WARN);
 * };
 *
 * // create a BaaCredentialsPanel-element within a templateResult
 * const getCredentialsPanel = () => {
 * 		return html`&lt;ba-auth-baa-credentials-panel .id=${securedId} .onCheck=${onCheck}	.onResolved=${onResolved}&gt;`;
 * };
 *
 * // using the panel as content for the modal
 * openModal('Connect with secured WMS...', getCredentialsPanel());
 * </pre>
 * @class
 * @property {string} id the id, which needs credentials for basic access authentication
 * @property {BaaCredentialsPanel~onCheckCallback} onCheck the onCheck callback
 * @property {BaaCredentialsPanel~onResolvedCallback} onResolved the onResolved callback
 * @author thiloSchlemmer
 */
export class BaaCredentialsPanel extends MvuElement {
	constructor() {
		super({
			id: null,
			credentials: Empty_Credentials,
			checkIsRunning: false
		});


		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onCheck = () => false;
		this._onResolved = () => { };
	}

	onInitialize() {
		this.observe(state => state.media.portrait, portrait => this.signal(Update_IsPortrait_Value, portrait));
		this.observe(state => state.modal, modal => this._resolveBeforeClosing(modal), false);
	}

	update(type, data, model) {

		switch (type) {
			case Update_ID:
				return { ...model, id: data };
			case Update_Username:
				return { ...model, credentials: { ...model.credentials, username: data } };
			case Update_Password:
				return { ...model, credentials: { ...model.credentials, password: data } };
			case Update_IsPortrait_Value:
				return { ...model, portrait: data };
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
		<div class='credentials__container ${getOrientationClass()}'>
			<div class='credentials_header'>
            	<span class='title_id'>${translate('auth_baaCredentialsPanel_title')}</span>
            	<span class='value_id'>${id}</span>
            </div>
            <div class='credentials_form'>
				<div class="fieldset" title="${translate('auth_baaCredentialsPanel_credentials_username')}">								
					<input required="required"  type="text" id="credentials_username"  @input=${onChangeUserName} >
					<label for="credentials_username" class="control-label">${translate('auth_baaCredentialsPanel_credentials_username')}</label><i class="bar"></i>
				</div>
				<div class="fieldset" title="${translate('auth_baaCredentialsPanel_credentials_password')}"">								
					<input required="required"  type="password" id="credentials_password"  @input=${onChangePassword}>
					<label for="credentials_password" class="control-label">${translate('auth_baaCredentialsPanel_credentials_password')}</label><i class="bar"></i>
				</div>
			</div>
			<div class='credentials_footer'>
			${this._getSubmitOrSpinner(model)}
            </div>
		</div>
		`;
	}

	_getSubmitOrSpinner(model) {
		const { id, credentials, checkIsRunning } = model;
		const translate = (key) => this._translationService.translate(key);

		const getSubmitButton = () => {
			const checkCredentials = async () => {
				this.signal(Update_Check_Is_Running, true);
				const credentialsValid = await this.onCheck(id, credentials);
				if (credentialsValid) {
					this.onResolved(credentials);
				}
				else {
					emitNotification(translate('auth_baaCredentialsPanel_credentials_rejected'), LevelTypes.WARN);
				}
				this.signal(Update_Check_Is_Running, false);
			};
			return html`<ba-button id='check-credentials-button'
			class="credentials_footer__button" .label=${translate('auth_baaCredentialsPanel_submit')} .type=${'primary'}                
			@click=${checkCredentials} ></ba-button>`;
		};

		const getSpinnerButton = () => {
			return html`<ba-button id='check-spinner-button' .disabled=${true}
			class="credentials_footer__button" .label=${translate('auth_baaCredentialsPanel_authenticate')} .type=${'primary'}              
			></ba-button>`;
		};
		return checkIsRunning ? getSpinnerButton() : getSubmitButton();

	}

	_resolveBeforeClosing(modal) {
		if (!modal.data) {
			this.onResolved(null);
		}
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

	set onResolved(callback) {
		this._onResolved = callback;
	}

	get onResolved() {
		return this._onResolved;
	}
}
