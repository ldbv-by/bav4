import { $injector } from '../injection';
import { isString } from '../utils/checks';
import { bvvProxifyUrlProvider } from './provider/proxifyUrl.provider';
import { bvvQrCodeProvider } from './provider/qrCodeUrlProvider';
import { shortenBvvUrls } from './provider/urlShorteningProvider';


/**
 * Utility service for URLs/resources.
 * @class
 * @author taulinger
 */
export class UrlService {

	/**
	 *
	 * @param {shortUrlProvider} [urlShorteningProvider=shortenBvvUrls]
	 * @param {proxifyUrlProvider} [proxifyUrlProvider=bvvProxifyUrlProvider]
	 */
	constructor(urlShorteningProvider = shortenBvvUrls, proxifyUrlProvider = bvvProxifyUrlProvider, qrCodeUrlProvider = bvvQrCodeProvider) {
		const { HttpService: httpService } = $injector.inject('HttpService');
		this._httpService = httpService;
		this._proxifyUrlProvider = proxifyUrlProvider;
		this._urlShorteningProvider = urlShorteningProvider;
		this._qrCodeUrlProvider = qrCodeUrlProvider;
	}

	/**
	* Proxifies a URL.
	* @param {string} url URL
	* @returns {string} proxified URL
	*/
	proxifyInstant(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
		}
		return this._proxifyUrlProvider(url);
	}

	/**
	* Proxifies a URL when needed.
	* @param {string} url URL
	* @public
	* @returns {Promise<string>|Promise.reject} proxified URL
	*/
	async proxify(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
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
	* @returns {Promise<boolean>|Promise.reject} `true`, if cors is enabled
	*/
	async isCorsEnabled(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
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
	 * @returns {Promise<string>|Promise.reject} shortened URL
	 * @throws Error of the underlying provider
	 */
	async shorten(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
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
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
		}
		return this._qrCodeUrlProvider(url);
	}

	/**
	 * Extracts the origin of an URL following by its pathname.
	 * If the URL has no pathname the result is the same like it would be calling {@link UrlService#origin}
	 * @param {string} url
	 * @throws TypeError
	 */
	originAndPathname(url) {
		const urlInstance = new URL(url);
		return `${urlInstance.origin}${urlInstance.pathname.length > 1 ? urlInstance.pathname : ''}`;
	}

	/**
	 * Extracts the origin of an URL.
	 * @param {string} url
	 * @throws TypeError
	 */
	origin(url) {
		const urlInstance = new URL(url);
		return `${urlInstance.origin}`;
	}
}
