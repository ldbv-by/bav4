export class ShareService {
	constructor(_navigator = window.navigator) {
		this._navigator = _navigator;
	}

	copyToClipboard(textToCopy) {
		return this._navigator.clipboard.writeText(textToCopy);
	}
} 