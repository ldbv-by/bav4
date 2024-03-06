/**
 * @module services/HttpService
 */
import { setFetching } from '../store/network/network.action';
import { $injector } from '../injection';
import { bvvHttpServiceIgnore401PathProvider } from './provider/auth.provider';
/**
 * A function that takes and returns a Fetch API `Response`.
 * @async
 * @typedef {Function} responseInterceptor
 * @param {Response} response Fetch API response
 * @param {function} fetchCall A function which can be used to retry the original fetch call
 * @param {String} resource the URL (resource) of the original fetch call
 * @returns {Promise<Response>} Fetch API response
 */

/**
 * Configuration for a `response` interceptor. A `request` interceptor may be available in the future.
 *
 * When more than one response interceptors are registered, they will be executed one after each other passing their `Response` object to the subsequent interceptor.
 * The `Response` object of the last interceptor of the list will be returned as the final result of the fetch call.
 * @typedef {Object} HttpServiceInterceptors
 * @property {Array<module:services/HttpService~responseInterceptor>} [response] A list of response interceptors.
 */
const defaultInterceptors = { response: [] };
/**
 * @class
 * @author taulinger
 */
export class HttpService {
	static get DEFAULT_REQUEST_MODE() {
		return 'cors';
	}

	/**
	 * Wraps a Fetch API fetch call, so that a custom timeout can be set. Default is 1000ms.<br>
	 * If a timeout occurs, the request is cancelled by an <code>AbortController</code>.<br>
	 * In that case, a promise with an <code>AbortError</code> is returned.<br>
	 * Additionally, the request can be made cancelable by a custom <code>AbortController</code><br>
	 * and can be intercepted by a `HttpServiceInterceptors` configuration (currently, only a response interceptor is supported).
	 * @param {String} resource url
	 * @param {Object} [options={}] fetch api options, set timeout via timeout property, default is 1000ms
	 * @param {AbortController} [controller=AbortController] controller which can be used to cancel the request
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={ response: [] }] interceptors for this fetch call
	 * @returns Fetch API response
	 * @see credits: https://dmitripavlutin.com/timeout-fetch-request/
	 */
	async fetch(resource, options = {}, controller = new AbortController(), interceptors = defaultInterceptors) {
		const doFetch = async () => {
			const { timeout = 1000 } = options;

			const id = setTimeout(() => controller.abort(), timeout);

			const response = await fetch(resource, {
				...options,
				signal: controller.signal
			});
			clearTimeout(id);
			return response;
		};

		const callResponseInterceptors = async (responseInterceptors, originalResponse, doFetch, resource) => {
			let response;
			for (const ric of responseInterceptors) {
				response = await ric(response ?? originalResponse, doFetch, resource);
			}
			return response;
		};

		return interceptors.response.length > 0 ? await callResponseInterceptors(interceptors.response, await doFetch(), doFetch, resource) : doFetch();
	}

	/**
	 * Convenience method for a GET call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} [options={}] fetch options
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={ response: [] }] interceptors for this GET call
	 * @returns Fetch API Response
	 */
	async get(resource, options = {}, interceptors = defaultInterceptors) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			...options
		};
		return this.fetch(resource, fetchOptions, undefined, interceptors);
	}

	/**
	 * Convenience method for a DELETE call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} [options={}] fetch options
	 * @returns Fetch API Response
	 */
	async delete(resource, options = {}) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'DELETE',
			...options
		};
		return this.fetch(resource, fetchOptions);
	}

	/**
	 * Convenience method for a POST call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} data POST body
	 * @param {string} contentType contentType
	 * @param {object} [options={}] fetch options
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={ response: [] }] interceptors for this POST call
	 * @returns Fetch API Response
	 */
	async post(resource, data, contentType, options = {}, interceptors = defaultInterceptors) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': contentType
			},
			...options
		};
		return this.fetch(resource, fetchOptions, undefined, interceptors);
	}

	/**
	 * Convenience method for a HEAD call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} [options={}] fetch options
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={ response: [] }] interceptors for this HEAD call
	 * @returns Fetch API Response
	 */
	async head(resource, options = {}, interceptors = defaultInterceptors) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'HEAD',
			...options
		};
		return this.fetch(resource, fetchOptions, undefined, interceptors);
	}
}

/**
 * {@link HttpService} that updates the 'fetching' property of the network state.
 * @class
 * @extends HttpService
 * @author taulinger
 */
export class NetworkStateSyncHttpService extends HttpService {
	/**
	 * @see {@link HttpService#fetch}
	 */
	async fetch(resource, options = {}, controller = new AbortController(), interceptors = defaultInterceptors) {
		setFetching(true);
		try {
			return await super.fetch(resource, options, controller, interceptors);
		} finally {
			setFetching(false);
		}
	}
}

/**
 * A function returning an array of paths (fragments) which should be ignored when matching endpoint returns a 401 HTTP status code.
 * @typedef {Function} httpServiceIgnore401PathProvider
 * @returns {Array<string>} path
 */

/**
 * {@link HttpService} that invalidates the current authentication when a status code 401 occurs.
 * @class
 * @extends NetworkStateSyncHttpService
 * @author taulinger
 */
export class AuthInvalidatingAfter401HttpService extends NetworkStateSyncHttpService {
	#authService;
	#configService;

	constructor(httpServiceIgnore401PathProvider = bvvHttpServiceIgnore401PathProvider) {
		super();
		const { AuthService: authService, ConfigService: configService } = $injector.inject('AuthService', 'ConfigService');
		this.#authService = authService;
		this.#configService = configService;
		this._ignorePathProvider = httpServiceIgnore401PathProvider;
	}
	/**
	 * @see {@link HttpService#fetch}
	 */
	async fetch(resource, options = {}, controller = new AbortController(), interceptors = defaultInterceptors) {
		const invalidateAfter401Interceptor = async (originalResponse) => {
			if (
				originalResponse.status === 401 &&
				resource.startsWith(this.#configService.getValueAsPath('BACKEND_URL')) &&
				!this._ignorePathProvider().find((path) => resource.includes(path))
			) {
				this.#authService.invalidate();
			}
			return originalResponse;
		};

		return super.fetch(resource, options, controller, { response: [invalidateAfter401Interceptor, ...interceptors.response] });
	}
}

/**
 * BVV specific {@link HttpService} that sets the Fetch API `credentials` option to `include` when a backend resource is called
 * cause Frontend and Backend may run on different origins.
 * Otherwise the `credentials` option stays untouched.
 * A given `credentials` option won't be overridden.
 *
 * @class
 * @extends AuthInvalidatingAfter401HttpService
 * @author taulinger
 */
export class BvvHttpService extends AuthInvalidatingAfter401HttpService {
	#configService;
	constructor() {
		super();
		const { ConfigService: configService } = $injector.inject('ConfigService');
		this.#configService = configService;
	}
	/**
	 * @see {@link HttpService#fetch}
	 */
	async fetch(resource, options = {}, controller = new AbortController(), interceptors = defaultInterceptors) {
		const fetchOptions = resource.startsWith(this.#configService.getValueAsPath('BACKEND_URL'))
			? { credentials: 'include', ...options }
			: { ...options };
		return super.fetch(resource, fetchOptions, controller, interceptors);
	}
}
