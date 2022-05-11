import { domPurifySanitizeHtml } from './provider/domPurifySanitizeHtml.provider';

export class SecurityService {

	constructor(sanitizeHtmlProvider = domPurifySanitizeHtml) {
		this._sanitizeHtmlProvider = sanitizeHtmlProvider;
	}

	sanitizeHtml(html) {
		return this._sanitizeHtmlProvider(html);
	}
}
