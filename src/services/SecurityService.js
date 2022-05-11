import { domPurifySanitizeHtmlProvider } from './provider/domPurifySanitizeHtml.provider';

export class SecurityService {

	constructor(sanitizeHtmlProvider = domPurifySanitizeHtmlProvider) {
		this._sanitizeHtmlProvider = sanitizeHtmlProvider;
	}

	sanitizeHtml(html) {
		this._sanitizeHtmlProvider(html);
	}
}
