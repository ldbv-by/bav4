import { baaCredentialFromUI, bvvBaaCredentialVerify } from './provider/baa.provider';

/**
 * Handles basic access authentication tasks.
 * @class
 */
export class BaaService {

	constructor(baaCredentialProvider = baaCredentialFromUI, baaCredentialsVerifyProvider = bvvBaaCredentialVerify) {
		this._baaCredentialProvider = baaCredentialProvider;
		this._baaCredentialVerifyProvider = baaCredentialsVerifyProvider;
	}

	/**
     * Provides basic access authentication credentials for a given URL.
     * @param {string} url the URL
     * @returns Credentials
     */
	async get(url) {
		return this._baaCredentialProvider(url);
	}

	/**
     * Verifies given credentials for a given URL
     * @param {string} url the URL
     * @returns Credentials
     */
	async verify(url, credentials) {
		return this._baaCredentialVerifyProvider(url, credentials);
	}
}
