import { $injector } from '../injection';
import { isHttpUrl } from '../utils/checks';

/**
 * @class
 * @author taulinger
 */
export class BaaCredentialService {
	constructor() {
		this._credentials = new Map();
		const { UrlService: urlService } = $injector.inject('UrlService');
		this._urlService = urlService;
	}

	/**
	 * Returns a basic access authentication credential object for a URL.
	 * Will return `null` when no credential is available or when `url` is not a valid URL.
	 * @param {string} url the URL
	 * @returns {Credential|null} credential
	 */
	get(url) {
		if (isHttpUrl(url)) {
			const credential = this._credentials.get(this._urlService.originAndPathname(url));
			return credential ? JSON.parse(atob(credential)) : null;
		}
		return null;
	}

	/**
	 * Adds or replaces a basic access authentication credential object for a given URL.
	 * @param {string} url
	 * @param {Credential} credential
	 * @returns `true` if the credential was successfully set.
	 */
	addOrReplace(url, credential) {
		if (isHttpUrl(url) && credential?.username && credential?.password) {
			this._credentials.set(this._urlService.originAndPathname(url), btoa(JSON.stringify({ ...credential })));
			return true;
		}
		return false;
	}
}
