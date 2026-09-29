/**
 * @module services/SecurityService
 */
import { removeHtmlWhitespace } from '@src/utils/markup';
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
	 * Sanitizes untrusted HTML, removes non-essential formatting, and strips unsafe attributes.
	 *
	 * This method sanitizes the input with the configured provider, removes any `<style>` and `<script>` elements,
	 * clears `style`, `class`, and `id` attributes on all nodes, and compacts the final markup by
	 * removing whitespace between tags and HTML comments.
	 *
	 * @param {string} htmlString The raw HTML to sanitize and normalize.
	 * @returns {string} The cleaned HTML string without unsafe markup and with compact formatting.
	 */
	sanitizeAndCleanHtml(htmlString) {
		/**
		 * Using new DOMParser().parseFromString() is safe from immediate script execution,
		 * but it is not a sanitizer and can lead to Cross-Site Scripting (XSS) if the parsed nodes are later inserted into the active document.
		 * therefore we use the SecurityService to get a sanitized HTML as TrustedHTML
		 */
		const parser = new DOMParser();
		const trustedHTML = this.createHtmlFromString(htmlString);
		const doc = parser.parseFromString(trustedHTML, 'text/html');
		// remove <style> tags
		const styleTags = doc.querySelectorAll('style');
		styleTags.forEach((tag) => tag.remove());
		// remove <script> tags
		const scriptTags = doc.querySelectorAll('script');
		scriptTags.forEach((tag) => tag.remove());

		// Remove unwanted attributes
		const elements = doc.querySelectorAll('*');
		elements.forEach((element) => {
			element.removeAttribute('style');
			element.removeAttribute('class');
			element.removeAttribute('id');
		});

		return removeHtmlWhitespace(doc.body.innerHTML);
	}

	/**
	 * Sanitizes untrusted HTML and returns it as trusted HTML when Trusted Types are available.
	 * @param {string} untrustedString The untrusted HTML content to sanitize.
	 * @returns {TrustedHTML|string} Sanitized HTML as TrustedHTML, or as a string when Trusted Types are unavailable.
	 */
	createHtmlFromString(untrustedString) {
		// fallback for older Browser
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
