/**
 * @module services/HttpService
 */
import { setFetching } from '../store/network/network.action';

/**
 * A function that takes and returns a Fetch API `Response`.
 * @async
 * @typedef {Function} responseInterceptor
 * @param {Response} response Fetch API response
 * @param {function} fetchCall A function which can be used to repeat the original fetch call
 * @param {String} resource the URL (resource) of the original fetch call
 * @returns {Promise<Response>} Fetch API response
 */

/**
 * Configuration for a response interceptor. A request interceptor may be available in the future.
 * @async
 * @typedef {Object} HttpServiceInterceptors
 * @property {module:services/HttpService~responseInterceptor} responseInterceptor
 */

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
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={}] interceptors for this fetch call
	 * @returns Fetch API response
	 * @see credits: https://dmitripavlutin.com/timeout-fetch-request/
	 */
	async fetch(resource, options = {}, controller = new AbortController(), interceptors = {}) {
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

		return interceptors.response ? interceptors.response(await doFetch(), doFetch, resource) : doFetch();
	}

	/**
	 * Convenience method for a GET call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} options fetch options
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={}] interceptors for this GET call
	 * @returns Fetch API Response
	 */
	async get(resource, options = {}, interceptors = {}) {
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
	 * @param {object} options fetch options
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
	 * @param {object} options fetch options
	 * @returns Fetch API Response
	 */
	async post(resource, data, contentType, options = {}) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': contentType
			},
			...options
		};
		return this.fetch(resource, fetchOptions);
	}

	/**
	 * Convenience method for a HEAD call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} options fetch options
	 * @param {module:services/HttpService~HttpServiceInterceptors} [interceptors={}] interceptors for this HEAD call
	 * @returns Fetch API Response
	 */
	async head(resource, options = {}, interceptors = {}) {
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
 * @author taulinger
 */
export class NetworkStateSyncHttpService extends HttpService {
	/**
	 * @see {@link HttpService#fetch}
	 */
	async fetch(resource, options = {}, controller = new AbortController(), interceptors = {}) {
		setFetching(true);
		try {
			return await super.fetch(resource, options, controller, interceptors);
		} finally {
			setFetching(false);
		}
	}
}
