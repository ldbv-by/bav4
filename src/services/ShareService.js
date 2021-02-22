export class ShareService {
	constructor(_window = window) {
		this._window = _window;
	}

	/**
	 * 
	 * @param {string} textToCopy 
	 * @returns {Promise<undefined> | Promise.reject}
	 */
	copyToClipboard(textToCopy) {
		if (this._window.isSecureContext) {
			return this._window.navigator.clipboard.writeText(textToCopy);
		}
		return Promise.reject(new Error('Clipboard API is not available'));
	}
} 