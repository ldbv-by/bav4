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
 * If the `PROXY_URL` config param is not available,
 * the unproxified url is returned.
 * @param {string} url url which should be proxified
 * @returns {string} proxified url
 */
export const bvvProxifyUrlProvider = (url) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	try {
		const proxyUrl = configService.getValueAsPath('PROXY_URL');
		return `${proxyUrl}?url=${encodeURIComponent(url)}`;
	}
	catch (e) {
		console.warn(e);
		return url;
	}
};
