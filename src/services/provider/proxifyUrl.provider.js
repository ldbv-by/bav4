/**
 * @module services/provider/proxifyUrl_provider
 */
import { $injector } from '../../injection';

/**
 * Returns a BVV -style proxified URL.
 * If the `PROXY_URL` config param is not available,
 * the unproxified url is returned.
 * If the URL is already proxified, nothing is done.
 * If the URL is a backend URL, nothing is done.
 * @function
 * @type {module:services/UrlService~proxifyUrlProvider}
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
	} catch (e) {
		console.warn(e);
	}
	return url;
};
