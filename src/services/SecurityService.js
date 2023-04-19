/**
 * @module services/SecurityService
 */
import { domPurifySanitizeHtml } from './provider/sanitizeHtml.provider';

export class SecurityService {
	constructor(sanitizeHtmlProvider = domPurifySanitizeHtml) {
		this._sanitizeHtmlProvider = sanitizeHtmlProvider;
	}

	sanitizeHtml(html) {
		return this._sanitizeHtmlProvider(html);
	}
}
