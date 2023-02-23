/**
 * @module service/provider
 */
import { $injector } from '../../injection';

/**
 * A function that takes a url and returns a promise with a short url.
 *
 * @typedef {function(string) : (Promise<string>)} shortUrlProvider
 */

/**
 * Uses the BVV service to return a short url.
 * @function
 * @param {string} url
 * @returns {Promise<string>}
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
