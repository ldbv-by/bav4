/**
 * A function that takes a url and returns a promise resolving with a {@link Credential} object.
 *
 * @typedef {function(string) : (Promise<Credential>)} baaCredentialProvider
 */

/**
 * Opens a UI mask where the user can enter credential information for a given url.
 * @param {string} url
 * @returns
 */
// eslint-disable-next-line no-unused-vars
export const baaCredentialFromUI = async (url) => {

	return new Promise((resolve, reject) => {
		/**
		 * Todo: here we will open our BaaCredentialsPanel. Depending on the result of its callback method,
		 * we either resolve or reject our Promise.
		 */
		reject();
	});
};


/**
 * A function that takes a url and credetials and returns a promise resolving with a {@link Credential} object.
 *
 * @typedef {function(string, Credential) : (Promise<Credential>)} baaCredentialVerifyProvider
 */

/**
 * Uses an BVV endpoint to verify the given credential on a URL.
 * @param {string} url
 * @param {Credential} credential
 * @returns
 */
// eslint-disable-next-line no-unused-vars
export const bvvBaaCredentialVerify = async (url, credential) => {

	/**
	 * Todo: implement me
	 */
	return Promise.reject();
};

