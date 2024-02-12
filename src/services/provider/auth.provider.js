/**
 * @module services/provider/auth_provider
 */
import { $injector } from '../../injection/index';
import { closeModal, openModal } from '../../store/modal/modal.action';
import { observe } from '../../utils/storeUtils';
import { html } from 'lit-html';
import { MediaType } from '../../domain/mediaTypes';
import { PromiseQueue } from '../../utils/PromiseQueue';

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

const createCredentialPanel = (url, authenticateFunction, onCloseFunction) => {
	return html`<ba-auth-password-credential-panel
		.url=${url}
		.authenticate=${authenticateFunction}
		.onClose=${onCloseFunction}
	></ba-auth-password-credential-panel>`;
};

const promiseQueue = new PromiseQueue();
/**
 * Bvv specific implementation of {@link module:services/HttpService~responseInterceptor}.
 * @function
 * @type {module:services/HttpService~responseInterceptor}
 *
 */
export const bvvAuthResponseInterceptor = async (response, doFetch, url) => {
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
						openModal(translate('global_import_authenticationModal_title'), createCredentialPanel(url, authenticate, onClose));
					}
				});
			};
			// in case of 401 we want the handler function to be executed one after each other
			return await promiseQueue.add(handler401);
		}
	}
	return response;
};
