/**
 * @module services/provider/auth_provider
 */
import { $injector } from '../../injection/index';
import { closeModal, openModal } from '../../store/modal/modal.action';
import { observe } from '../../utils/storeUtils';
import { html } from 'lit-html';
import { MediaType } from '../../domain/mediaTypes';
import { PromiseQueue } from '../../utils/PromiseQueue';
import { BvvRoles } from '../../domain/roles';

/**
 * Bvv specific implementation of {@link module:services/AuthService~signInProvider}.
 * @function
 * @type {module:services/AuthService~signInProvider}
 */
export const bvvSignInProvider = async (credential) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const result = await httpService.post(`${configService.getValueAsPath('BACKEND_URL')}auth/signin`, JSON.stringify(credential), MediaType.JSON);

	switch (result.status) {
		case 200:
			return await result.json();
		case 400:
			return [];
		default:
			throw new Error(`Sign in not possible: Http-Status ${result.status}`);
	}
};

/**
 * Bvv specific implementation of {@link module:services/AuthService~signOutProvider}.
 * @function
 * @type {module:services/AuthService~signOutProvider}
 */
export const bvvSignOutProvider = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const result = await httpService.get(`${configService.getValueAsPath('BACKEND_URL')}auth/signout`);

	switch (result.status) {
		case 200:
			return true;
		default:
			throw new Error(`Sign out not possible: Http-Status ${result.status}`);
	}
};

const createCredentialPanel = (authenticateFunction, onCloseFunction, roles) => {
	const footer = roles.includes(BvvRoles.PLUS) ? html`<ba-auth-password-credential-bvv-footer></ba-auth-password-credential-bvv-footer>` : null;
	return html`<ba-auth-password-credential-panel
		.authenticate=${authenticateFunction}
		.onClose=${onCloseFunction}
		.footer=${footer}
	></ba-auth-password-credential-panel>`;
};

const promiseQueue = new PromiseQueue();
/**
 * Bvv specific implementation of {@link module:services/AuthService~authResponseInterceptorProvider}.
 * @function
 * @type {module:services/AuthService~authResponseInterceptorProvider}
 * @param {string[]} roles
 */
export const bvvAuthResponseInterceptorProvider = (roles = []) => {
	const bvvAuthResponseInterceptor = async (response, doFetch) => {
		// in that case we open the credential ui as modal window
		switch (response.status) {
			case 401: {
				const handler401 = () => {
					return new Promise((resolve) => {
						const {
							StoreService: storeService,
							TranslationService: translationService,
							AuthService: authService
						} = $injector.inject('StoreService', 'TranslationService', 'AuthService');
						const translate = (key) => translationService.translate(key);

						const authenticate = async (credential) => {
							const authenticated = await authService.signIn(credential);
							if (authenticated) {
								return true;
							}

							return false;
						};

						// in case of aborting the authentication-process by closing the modal we call the onClose callback
						const resolveBeforeClosing = ({ active }) => {
							if (!active) {
								onClose(null);
							}
						};

						const unsubscribe = observe(
							storeService.getStore(),
							(state) => state.modal,
							(modal) => resolveBeforeClosing(modal)
						);

						// onClose-callback is called with a verified credential object and the result object or simply null
						const onClose = async (credential, currentResponse) => {
							unsubscribe();
							closeModal();
							if (credential && currentResponse) {
								// re-try the original fetch call
								const reTryResponse = await doFetch();
								resolve(reTryResponse);
							} else {
								// resolve with the original response
								resolve(response);
							}
						};

						// if we are signed-in in the meantime (e.g. when multiple restricted GeoResources are requested) we re-try the original call
						if (authService.isSignedIn()) {
							// re-try the original fetch call
							resolve(doFetch());
						}
						// let's open the credential panel in that case
						else {
							const title = html`${translate('global_import_authenticationModal_title')}&nbsp;
							${roles.map(
								(role) => html`<ba-badge .size=${'1.5'} .color=${'var(--text3)'} .background=${'var(--primary-color)'} .label=${role}></ba-badge>`
							)} `;
							openModal(title, createCredentialPanel(authenticate, onClose, roles));
						}
					});
				};
				// in case of 401 we want the handler function to be executed one after each other
				return await promiseQueue.add(handler401);
			}
		}
		return response;
	};

	return bvvAuthResponseInterceptor;
};

/**
 * Bvv specific implementation of {@link module:services/HttpService~httpServiceIgnore401PathProvidern}.
 * @function
 * @type {module:services/HttpService~httpServiceIgnore401PathProvider}
 */
export const bvvHttpServiceIgnore401PathProvider = () => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	return [`${configService.getValueAsPath('BACKEND_URL')}sourceType`];
};
