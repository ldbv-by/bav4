import { $injector } from '../injection';
import { isString } from '../utils/checks';
import { shortenBvvUrls } from './provider/urlShorteningProvider';

const defaultProxyTemplateProvider = (proxyUrl, url) => {
	return `${proxyUrl}?url=${url}`;
};

/**
 * Utility service for urls/resources.
 * @class
 * @author aul
 */
export class UrlService {

	constructor(urlShorteningProvider = shortenBvvUrls, templateProvider = defaultProxyTemplateProvider) {
		const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
		this._httpService = httpService;
		this._proxyUrl = configService.getValueAsPath('PROXY_URL');
		this._templateProvider = templateProvider;
		this._urlShorteningProvider = urlShorteningProvider;
	}

	/**
	* Proxifies a url.
	* @param {string} url 
	* @returns {string} proxified url
	*/
	proxifyInstant(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
		}
		return this._templateProvider(this._proxyUrl, encodeURIComponent(url));
	}

	/**
	* Proxifies a url when needed.
	* @param {string} url
	* @public
	* @returns {Promise<string>|Promise.reject} proxified url
	*/
	async proxify(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
		}
		const corsEnabled = await this.isCorsEnabled(url);
		if (corsEnabled) {
			return url;
		}
		return this._templateProvider(this._proxyUrl, encodeURIComponent(url));
	}

	/**
	* Tests if the remote resource enables CORS by using a head request
	* @param {string} url
	* @public
	* @returns {Promise<boolean>|Promise.reject} `true`, if cors is enabled
	*/
	async isCorsEnabled(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
		}

		const result = await this._httpService.fetch(url, {
			timeout: 1500,
			method: 'HEAD'
		});
		return result.ok;
	}

	/**
	 * Shortens an url.
	 * @param {string} url 
	 * @async 
	 * @public
	 * @returns {Promise<string>|Promise.reject} shortened url
	 */
	async shorten(url) {
		if (!isString(url)) {
			throw new TypeError('Parameter \'url\' must be a string');
		}
		return this._urlShorteningProvider(url);
	}
}