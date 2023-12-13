/**
 * @module services/provider/qrCodeUrlProvider
 */
import { $injector } from '../../injection';

/**
 * Uses the BVV service to return a qrCode URL.
 * @async
 * @type {module:services/UrlService~qrCodeUrlProvider}
 */
export const bvvQrCodeProvider = (url) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	return url.trim().startsWith(configService.getValueAsPath('SHORTENING_SERVICE_URL'))
		? `${url}.png` // we already have a shortened URL
		: `${configService.getValueAsPath('SHORTENING_SERVICE_URL')}?url=${encodeURIComponent(url)}`;
};
