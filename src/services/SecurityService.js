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

	/**
	 * Sanitizes untrusted HTML and returns it as trusted HTML when Trusted Types are available.
	 * @param {string} untrustedString The untrusted HTML content to sanitize.
	 * @returns {TrustedHTML|string} Sanitized HTML as TrustedHTML, or as a string when Trusted Types are unavailable.
	 */
	createHtmlFromString(untrustedString) {
		if (typeof trustedTypes === 'undefined') {
			// eslint-disable-next-line no-global-assign
			trustedTypes = { createPolicy: (n, rules) => rules };
		}
		const policy = trustedTypes.createPolicy('ba-untrustedString-policy', {
			createHTML: (input) => this.sanitizeHtml(input)
		});
		const trustedHTML = policy.createHTML(untrustedString);

		return trustedHTML;
	}
}
