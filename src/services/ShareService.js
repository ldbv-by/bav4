export class ShareService {
	constructor(_navigator = navigator) {
		this._navigator = _navigator;
	}

	copyToClipboard(textToCopy) {
		return this._navigator.clipboard.writeText(textToCopy);
	}
} 