/**
 * @module services/SecurityService
 */
import { domPurifySanitizeHtml } from './provider/sanitizeHtml.provider';

/**
 * @class
 */
export class SecurityService {
	constructor(sanitizeHtmlProvider = domPurifySanitizeHtml) {
		this._sanitizeHtmlProvider = sanitizeHtmlProvider;
	}

	/**
	 * Returns the given html string as sanitized string.
	 * @param {string} html The html content to be sanitized.
	 * @returns {string} The sanitized html content.
	 */
	sanitizeHtml(html) {
		return this._sanitizeHtmlProvider(html);
	}
}
