/**
 * @module services/AuthService
 */
/**
 * @async
 * @typedef {Function} signInProvider
 * @param {module:domain/credentialDef~Credential} credential
 * @throws `Error` when signIn was not possible due to a technical error
 * @returns {Array<string>}  An array of roles or an empty array when signIn was not successful
 */

/**
 * A function that returns an response interceptor for authentication tasks
 * @async
 * @typedef {Function} authResponseInterceptorProvider
 * @param {string[]} [roles] One or more roles the interceptor should show an auth UI for
 * @returns {module:services/HttpService~responseInterceptor} the response interceptor
 */

import { $injector } from '../injection/index';
import { bvvAuthResponseInterceptorProvider, bvvSignInProvider } from './provider/auth.provider';

/**
 * Service for authentication and authorization tasks.
 *
 * @class
 * @author taulinger
 */
export class AuthService {
	#geoResourceService;
	/**
	 *
	 * @param {module:services/AuthService~signInProvider} [signInProvider=bvvSignInProvider]
	 * @param {module:services/AuthService~authResponseInterceptorProvider} [authResponseInterceptorProvider=bvvAuthResponseInterceptorProvider]
	 */
	constructor(signInProvider = bvvSignInProvider, authResponseInterceptorProvider = bvvAuthResponseInterceptorProvider) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this.#geoResourceService = geoResourceService;
		this._singInProvider = signInProvider;
		this._authResponseInterceptorProvider = authResponseInterceptorProvider;
		this._roles = [];
	}

	/**
	 *
	 * @returns {Array<String>} the current roles or an empty `array`
	 */
	getRoles() {
		return [...this._roles];
	}

	/**
	 * Checks if the current user is signed in.
	 * @returns {boolean} `true` if the current user is signed in
	 */
	isSignedIn() {
		return this._roles.length > 0;
	}

	/**
	 * Checks if the current roles allow to access a certain GeoResource.
	 * Returns `false` if the GeoResource does not exist or the user is not signed in.
	 * @param {string} geoResourceId The id of a GeoResource
	 * @returns {boolean} `true` if a GeoResource is allowed to access
	 */
	isAuthorizedFor(geoResourceId) {
		const gr = this.#geoResourceService.byId(geoResourceId);
		if (gr && this.isSignedIn()) {
			return gr.authRoles.length === 0 ? true : gr.authRoles.filter((role) => this._roles.includes(role)).length > 0;
		}
		return false;
	}

	/**
	 *
	 * @param {module:domain/credentialDef~Credential} credential
	 * @returns {Promise<boolean>} `true` if sign in was successful
	 * @throws Error of the underlying provider
	 */
	async signIn(credential) {
		const roles = await this._singInProvider(credential);
		this._roles = [...roles];
		return this._roles.length > 0;
	}

	/**
	 * Returns a {@link module:services/HttpService~responseInterceptor} suitable authenticating for a given GeoResource.
	 * @param {string} geoResourceId The id of a GeoResource
	 * @returns {module:services/HttpService~responseInterceptor}
	 */
	getAuthResponseInterceptorForGeoResource(geoResourceId) {
		const roles = this.#geoResourceService.byId(geoResourceId)?.authRoles ?? [];
		return this._authResponseInterceptorProvider(roles);
	}
}
