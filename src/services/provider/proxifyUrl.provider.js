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
 * Returns a BVV -style proxified URL.
 * If the `PROXY_URL` config param is not available,
 * the unproxified url is returned.
 * If the URL is already proxied, nothing is done.
 * If the URL is a backend URL, nothing is done.
 * @param {string} url URL which should be proxified
 * @returns {string} proxified URL
 */
export const bvvProxifyUrlProvider = (url) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	try {
		const backendUrl = configService.getValueAsPath('BACKEND_URL');
		const proxyUrl = configService.getValueAsPath('PROXY_URL');
		if (url.trim().startsWith(backendUrl) || url.trim().startsWith(proxyUrl)) {
			return url;
		}
		return `${proxyUrl}?url=${encodeURIComponent(url)}`;
	}
	catch (e) {
		console.warn(e);
	}
	return url;
};
