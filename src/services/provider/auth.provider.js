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
 * BVV specific implementation of {@link module:services/AuthService~signInProvider}.
 * @function
 * @type {module:services/AuthService~signInProvider}
 */
export const bvvSignInProvider = async () => {
	const roles = [BvvRoles.PLUS];

	return new Promise((resolve) => {
		const {
			StoreService: storeService,
			HttpService: httpService,
			ConfigService: configService
		} = $injector.inject('StoreService', 'HttpService', 'ConfigService');

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

		const authenticate = async (credential) => {
			const result = await httpService.post(`${configService.getValueAsPath('BACKEND_URL')}auth/signin`, JSON.stringify(credential), MediaType.JSON);

			switch (result.status) {
				case 200:
					return await result.json();
				case 400:
					return false;
				default:
					throw new Error(`Sign in not possible: Http-Status ${result.status}`);
			}
		};

		// onClose-callback is called with a verified credential object and the result object or simply null
		const onClose = async (credential, roles) => {
			unsubscribe();
			closeModal();
			if (credential && roles) {
				resolve(roles);
			} else {
				// resolve with empty roles
				resolve([]);
			}
		};

		openModal(createCredentialModalTitle(roles), createCredentialPanel(authenticate, onClose, roles));
	});
};

/**
 * BVV specific implementation of {@link module:services/AuthService~signOutProvider}.
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

const createCredentialModalTitle = (roles) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');
	const translate = (key) => translationService.translate(key);
	const title = html`${translate('global_import_authenticationModal_title')}&nbsp;
	${roles.map((role) => html`<ba-badge .size=${'1.5'} .color=${'var(--text3)'} .background=${'var(--primary-color)'} .label=${role}></ba-badge>`)} `;
	return title;
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
const resourcesInQueue = new Set();
/**
 * Amount of time the credential panel should not be shown for the same identifier.
 */
export const BvvCredentialPanelIntervalMs = 10_000;
/**
 * BVV specific implementation of {@link module:services/AuthService~authResponseInterceptorProvider}.
 * @function
 * @type {module:services/AuthService~authResponseInterceptorProvider}
 * @param {string[]} roles
 * @param {string} [identifier=null]
 */
export const bvvAuthResponseInterceptorProvider = (roles = [], identifier = null, credentialPanelInterval = BvvCredentialPanelIntervalMs) => {
	const bvvAuthResponseInterceptor = async (response, doFetch) => {
		switch (response.status) {
			// in that case we open the credential ui as modal window
			case 401: {
				const handler401 = () => {
					return new Promise((resolve) => {
						const {
							StoreService: storeService,
							AuthService: authService
						} = $injector.inject('StoreService', 'AuthService');

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
						// let's open the credential panel for that case
						else if (!resourcesInQueue.has(identifier)) {
							/**
							 * Needed for resources which trigger multiple requests at once (e.g. XyZGeoResources).
							 * To avoid showing the credential panel for the same resource in quick succession we synchronize by a Set.
							 * The resource is represented by its identifier.
							 * After the given amount of time the identifier will be removed from the Set.
							 */
							if (identifier) {
								resourcesInQueue.add(identifier);
								setTimeout(() => {
									resourcesInQueue.delete(identifier);
								}, credentialPanelInterval);
							}

							// prepare the modal
							openModal(createCredentialModalTitle(roles), createCredentialPanel(authenticate, onClose, roles));
						}
						// return the original response
						else {
							resolve(response);
						}
					});
				};
				return await promiseQueue.add(handler401);
			}
		}
		return response;
	};

	return bvvAuthResponseInterceptor;
};

/**
 * BVV specific implementation of {@link module:services/HttpService~httpServiceIgnore401PathProvider}.
 * @function
 * @type {module:services/HttpService~httpServiceIgnore401PathProvider}
 */
export const bvvHttpServiceIgnore401PathProvider = () => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	return [`${configService.getValueAsPath('BACKEND_URL')}sourceType`];
};
