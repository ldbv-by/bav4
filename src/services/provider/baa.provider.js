import { MediaType } from '../HttpService';


/**
 * A function that takes a url and returns a promise resolving with a {@link Credential} object.
 *
 * @typedef {function(string) : (Promise<Credential>)} baaCredentialProvider
 */

import { $injector } from '../../injection';

/**
 * Opens a UI mask where the user can enter username/password for a given url.
 * @param {string} url
 * @returns {Credential} credential
 */
// eslint-disable-next-line no-unused-vars
export const baaCredentialFromUI = async (url) => {

	return new Promise((resolve, reject) => {
		/**
		 * Todo: here we will open our BaaCredentialsPanel. Depending on the result of its callback method,
		 * we either resolve or reject our Promise.
		 */
		reject('not yet implemented');
	});
};


/**
 * A function that takes a url and a credential object and returns a promise resolving with a {@link Credential} object.
 *
 * @typedef {function(string, Credential) : (Promise<Credential>)} baaCredentialVerifyProvider
 */

/**
 * Uses an BVV endpoint to verify the given credential on a URL.
 * @param {string} url
 * @param {Credential} credential
 * @returns the verified credential object
 */
export const bvvBaaCredentialVerify = async (url, credential) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'verifyCredential';
	const requestPayload = {
		...credential,
		url: url
	};
	const { status } = await httpService.post(endpointUrl, JSON.stringify(requestPayload), MediaType.JSON, {
		timeout: 2000
	});

	switch (status) {
		case 200:
			return Promise.resolve(credential);
		default:
			return Promise.reject(status);
	}
};

