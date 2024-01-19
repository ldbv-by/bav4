/**
 * @module services/UrlService
 */
import { $injector } from '../injection';
import { isHttpUrl } from '../utils/checks';
import { bvvProxifyUrlProvider } from './provider/proxifyUrl.provider';
import { bvvQrCodeProvider } from './provider/qrCodeUrlProvider';
import { shortenBvvUrls } from './provider/urlShorteningProvider';

/**
 * A function that takes a url and returns a promise with a short url.
 * @async
 * @param {string} url the URL which should be shortened
 * @typedef {Function} shortUrlProvider
 * @returns {string} short URL
 */

/**
 * Takes a URL and returns a proxified url.
 * @param {string} url the URL which should be proxified
 * @typedef {Function} proxifyUrlProvider
 * @returns {string} proxied url
 */

/**
 * A function that takes a URL (as string) and returns a URL (as string).
 * The returned URL references to the qrCode image for the given URL.
 *
 * @async
 * @param {string} url the URL which should be enccoded as QrCode.
 * @typedef {Function} qrCodeUrlProvider
 * @returns {string} URL for the QrCode image
 */

/**
 * Utility service for URLs/resources.
 * @class
 * @author taulinger
 */
export class UrlService {
	/**
	 * @param {module:services/UrlService~shortUrlProvider} [urlShorteningProvider=shortenBvvUrls]
	 * @param {module:services/UrlService~proxifyUrlProvider} [proxifyUrlProvider=bvvProxifyUrlProvider]
	 * @param {module:services/UrlService~qrCodeUrlProvider} [proxifyUrlProvider=bvvQrCodeProvider]
	 */
	constructor(urlShorteningProvider = shortenBvvUrls, proxifyUrlProvider = bvvProxifyUrlProvider, qrCodeUrlProvider = bvvQrCodeProvider) {
		const { HttpService: httpService } = $injector.inject('HttpService');
		this._httpService = httpService;
		this._proxifyUrlProvider = proxifyUrlProvider;
		this._urlShorteningProvider = urlShorteningProvider;
		this._qrCodeUrlProvider = qrCodeUrlProvider;
	}

	/**
	 * Proxies an URL.
	 * @param {string} url URL
	 * @param {boolean} [strict=true] if `true` throws an `Error` when the parameter `url` is not an URL. If set to `false` it returns the `url` untouched in that case
	 * @returns {string} proxied URL
	 */
	proxifyInstant(url, strict = true) {
		if (!isHttpUrl(url)) {
			if (strict) {
				throw new TypeError("Parameter 'url' must represent an URL");
			}
			return url;
		}
		return this._proxifyUrlProvider(url);
	}

	/**
	 * Proxies an URL when needed.
	 * @param {string} url URL
	 * @param {boolean} [strict=true] if `true` throws an `Error` when the parameter `url` is not an URL. If set to `false` it returns the `url` untouched in that case
	 * @returns {Promise<string>} proxied URL
	 */
	async proxify(url, strict = true) {
		if (!isHttpUrl(url)) {
			if (strict) {
				throw new TypeError("Parameter 'url' must represent an URL");
			}
			return url;
		}
		const corsEnabled = await this.isCorsEnabled(url);
		if (corsEnabled) {
			return url;
		}
		return this._proxifyUrlProvider(url);
	}

	/**
	 * Tests if the remote resource enables CORS by using a head request
	 * @param {string} url URL
	 * @public
	 * @returns {Promise<boolean>} `true`, if cors is enabled
	 */
	async isCorsEnabled(url) {
		if (!isHttpUrl(url)) {
			throw new TypeError("Parameter 'url' must represent an URL");
		}

		const result = await this._httpService.head(url, {
			timeout: 1500
		});
		return result.ok;
	}

	/**
	 * Shortens a URL.
	 * Possible errors of the configured shortUrlProvider will be passed.
	 * @param {string} url URL
	 * @public
	 * @returns {Promise<string>} shortened URL
	 * @throws Error of the underlying provider
	 */
	async shorten(url) {
		if (!isHttpUrl(url)) {
			throw new TypeError("Parameter 'url' must represent an URL");
		}
		return this._urlShorteningProvider(url);
	}

	/**
	 * Returns a URL of an qrCode image that corresponds to the given URL.
	 * @param {string} url URL to be encoded as qrCode
	 * @returns {string} qrCode image URL
	 * @throws Error of the underlying provider
	 */
	qrCode(url) {
		if (!isHttpUrl(url)) {
			throw new TypeError("Parameter 'url' must represent an URL");
		}
		return this._qrCodeUrlProvider(url);
	}

	/**
	 * Extracts the origin of a URL following by its pathname.
	 * If the URL has no pathname the result is the same like it would be calling {@link UrlService#origin}
	 * @param {string} url
	 * @returns {string} origin and pathname
	 * @throws TypeError
	 */
	originAndPathname(url) {
		const urlInstance = new URL(url);
		return `${urlInstance.origin}${urlInstance.pathname.length > 1 ? urlInstance.pathname : ''}`;
	}

	/**
	 * Extracts the origin of a URL.
	 * @param {string} url
	 * @returns {string} origin
	 * @throws TypeError
	 */
	origin(url) {
		const urlInstance = new URL(url);
		return `${urlInstance.origin}`;
	}

	/**
	 * Extracts the path parameters of a URL.
	 * @param {string} url
	 * @returns {string[]} path parameters
	 * @throws TypeError
	 */
	pathParams(url) {
		const urlInstance = new URL(url);
		return urlInstance.pathname.split('/').filter((pp) => pp.length > 0);
	}
}
