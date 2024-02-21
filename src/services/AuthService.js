/**
 * @module services/AuthService
 */
/**
 * @async
 * @typedef {Function} signInProvider
 * @param {module:domain/credentialDef~Credential} credential
 * @throws `Error` when sign in was not possible due to a technical error
 * @returns {Array<string>}  An array of roles or an empty array when sign in was not successful
 */
/**
 * @async
 * @typedef {Function} signOutProvider
 * @throws `Error` when sign out was not possible due to a technical error
 * @returns {boolean}  `true` when sign out was successful
 */

/**
 * A function that returns an response interceptor for authentication tasks
 * @async
 * @typedef {Function} authResponseInterceptorProvider
 * @param {string[]} [roles] One or more roles the interceptor should show an auth UI for
 * @returns {module:services/HttpService~responseInterceptor} the response interceptor
 */

import { $injector } from '../injection/index';
import { setSignedIn, setSignedOut } from '../store/auth/auth.action';
import { bvvAuthResponseInterceptorProvider, bvvSignInProvider, bvvSignOutProvider } from './provider/auth.provider';

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
	 * @param {module:services/AuthService~signOutProvider} [signOutProvider=bvvSignInProvider]
	 * @param {module:services/AuthService~authResponseInterceptorProvider} [authResponseInterceptorProvider=bvvAuthResponseInterceptorProvider]
	 */
	constructor(
		signInProvider = bvvSignInProvider,
		signOutProvider = bvvSignOutProvider,
		authResponseInterceptorProvider = bvvAuthResponseInterceptorProvider
	) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this.#geoResourceService = geoResourceService;
		this._singInProvider = signInProvider;
		this._singOutProvider = signOutProvider;
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
	 * Sign in. Returns `true` if the user is already signed in.
	 * @param {module:domain/credentialDef~Credential} credential
	 * @returns {Promise<boolean>} `true` if sign in was successful
	 * @throws Error of the underlying provider
	 */
	async signIn(credential) {
		if (!this.isSignedIn()) {
			const roles = await this._singInProvider(credential);
			this._roles = [...roles];
			if (this._roles.length > 0) {
				setSignedIn();
				return true;
			}
			return false;
		}
		return true;
	}

	/**
	 * Sign out. Returns `true` if the user was not signed in.
	 * @returns {Promise<boolean>} `true` if sign out was successful
	 * @throws Error of the underlying provider
	 */
	async signOut() {
		if (this.isSignedIn()) {
			const result = await this._singOutProvider();
			if (result) {
				this._roles = [];
				setSignedOut();
			}
			return result;
		}
		return true;
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
