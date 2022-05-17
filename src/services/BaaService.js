import { isHttpUrl } from '../utils/checks';
import { baaCredentialFromUI, bvvBaaCredentialVerify } from './provider/baa.provider';

/**
 * Handles basic access authentication tasks.
 * @class
 */
export class BaaService {

	constructor(baaCredentialProvider = baaCredentialFromUI, baaCredentialVerifyProvider = bvvBaaCredentialVerify) {
		this._baaCredentialProvider = baaCredentialProvider;
		this._baaCredentialVerifyProvider = baaCredentialVerifyProvider;
	}

	/**
	 * Returns a basic access authentication credential object for a URL.
	 * Will reject with no reason when no credential is available or when `url` is not a valid URL.
	 * @param {string} url the URL
	 * @returns {Credential|null} credential
	 */
	async get(url) {
		if (isHttpUrl(url)) {
			return this._baaCredentialProvider(url);
		}
		console.warn(`${url} is not a valid HTTP URL`);
		throw new Error();
	}

	/**
	 * Checks if a credential object is accepted by a given URL.
	 * Will reject with the http status code when credential information was not accepted.
	 * Will reject with no reason when `url` is not a valid URL.
	 * @param {string} url the URL
	 * @returns  {Credential} credential
	 */
	async verify(url, credential) {
		if (isHttpUrl(url)) {
			return this._baaCredentialVerifyProvider(url, credential);
		}
		console.warn(`${url} is not a valid HTTP URL`);
		throw new Error();
	}
}
