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
     * Will reject with no reason when no credential is available.
     * @param {string} url the URL
     * @returns {Credential|null} credential
     */
	async get(url) {
		return this._baaCredentialProvider(url);
	}

	/**
     * Checks if a credential object is accepted by a given URL.
     * Will reject with the http status code when credential information was not accepted.
     * @param {string} url the URL
     * @returns  {Credential} credential
     */
	async verify(url, credential) {
		return this._baaCredentialVerifyProvider(url, credential);
	}
}
