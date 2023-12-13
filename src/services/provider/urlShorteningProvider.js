/**
 * @module services/provider/urlShorteningProvider
 */
import { $injector } from '../../injection';

/**
 *  Bvv specific implementation of {@link module:services/UrlService~shortUrlProvider}
 * @async
 * @type {module:services/UrlService~shortUrlProvider}
 */
export const shortenBvvUrls = async (url) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const shortenGetRequestUrl = `${configService.getValueAsPath('SHORTENING_SERVICE_URL')}?createcode=${encodeURIComponent(url)}`;
	const response = await httpService.get(shortenGetRequestUrl);

	if (response.ok) {
		const result = await response.json();
		return result.shorturl;
	}
	throw new Error('A short url could not be retrieved');
};
