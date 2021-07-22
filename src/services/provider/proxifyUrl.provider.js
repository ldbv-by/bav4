/**
 * @module service/provider
 */

import { $injector } from '../../injection';

/**
 * Takes an url and returns a proxified url.
 *
 * @typedef {function(url) : (string)} proxifyUrlProvider
 */


/**
 * Returns a BVV -style proxified url.
 * @param {string} url url which should be proxified
 * @returns {string} proxified url
 */
export const bvvProxifyUrlProvider = (url) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	const proxyUrl = configService.getValueAsPath('PROXY_URL');
	return `${proxyUrl}?url=${encodeURIComponent(url)}`;
};
