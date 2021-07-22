/**
 * @module service/provider
 */
import { $injector } from '../../injection';

/**
 * A function that takes an URL (as string) and returns a URL (as string).
 * The returned URL references to the qrCode image for the given URL.
 *
 * @typedef {function(string) : (string)} qrCodeUrlProvider
 */



/**
 * Uses the BVV service to return a qrCode URL.
 * @function
 * @param {string} url URL
 * @returns {string} qrCode URL
 */
export const bvvQrCodeProvider = (url) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	const shortenGetRequestUrl = `${configService.getValueAsPath('SHORTENING_SERVICE_URL')}?url=${encodeURIComponent(url)}`;
	return shortenGetRequestUrl;
};