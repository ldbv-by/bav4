import { setFetching } from '../store/network/network.action';

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
	   * Additionally, the request can be made cancelable by an custom <code>AbortController</code>.<br>
	   * @param {String} resource url
	   * @param {Object} [options] fetch api options, set timeout via timeout property, default is 1000ms
	   * @param {AbortController} [controller] controller which can be used to cancel the request
	   * @returns Fetch API Response
	   * @see credits: https://dmitripavlutin.com/timeout-fetch-request/
	   */
	async fetch(resource, options = {}, controller = new AbortController()) {

		const { timeout = 1000 } = options;

		const id = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(resource, {
			...options,
			signal: controller.signal
		});
		clearTimeout(id);

		return response;
	}

	/**
	 * Convenience method for a GET call.
	 * Uses {@link HttpService#fetch}.
	 * Mode 'cors' ist set by default.
	 * @param {string} resource URL
	 * @param {object} options fetch options
	 * @returns Fetch API Response
	 */
	async get(resource, options = {}) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
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
	 * @returns Fetch API Response
	 */
	async head(resource, options = {}) {
		const fetchOptions = {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			method: 'HEAD',
			...options
		};
		return this.fetch(resource, fetchOptions);
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
	async fetch(resource, options = {}, controller = new AbortController()) {
		setFetching(true);
		try {
			return await super.fetch(resource, options, controller);
		}
		finally {
			setFetching(false);
		}
	}
}

/**
 * Enum for common media types.
 */
export const MediaType = Object.freeze({
	JSON: 'application/json',
	TEXT_HTML: 'text/html',
	TEXT_PLAIN: 'text/plain',
	KML: 'application/vnd.google-earth.kml+xml',
	GPX: 'application/gpx+xml',
	GeoJSON: 'application/geo+json'
});
