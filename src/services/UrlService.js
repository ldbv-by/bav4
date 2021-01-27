import { $injector } from '../injection';

/**
 * Utility service for urls/resources.
 * @class
 * @author aul
 */
export class UrlService {


	constructor() {
		const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
		this._httpService = httpService;
		this._configService = configService;
	}

	/**
   * Proxifies a url.
   * @param {string} url 
   */
	proxifyInstant(url) {
		const proxyUrl = this._configService.getValue('PROXY_URL');
		return proxyUrl + '?' + encodeURIComponent(url);
	}

	/**
   * Proxifies a url when needed.
   * @param {string} url
   * @async
   * @public
   */
	async proxify(url) {
		const corsEnabled = await this.isCorsEnabled();
		if (corsEnabled) {
			return url;
		}

		const proxyUrl = this._configService.getValue('PROXY_URL');
		return proxyUrl + '?' + encodeURIComponent(url);
	}

	/**
   * Tests if the remote resource enables CORS by using a head request
   * @param {string} url
   * @async 
   * @public
   */
	async isCorsEnabled(url) {
		const result = await this._httpService.fetch(url, {
			timeout: 1500,
			method: 'HEAD',
			mode: 'cors'
		});
		return result.ok;
	}
}