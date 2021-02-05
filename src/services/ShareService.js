import { html } from 'lit-html';
import { openModal } from './../modules/modal/store/modal.action';
import { $injector } from '../injection';
export class ShareService {
	constructor(_navigator = navigator) {
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._navigator = _navigator;
	}

	copyToClipboard(textToCopy) {
		return this._navigator.clipboard.writeText(textToCopy);
	}

	async share(title = '', text = '', urlToShare) {

		const shareData = {
			title:title,
			text:text,
			url:urlToShare
		};

		try {
			await this._navigator.share(shareData);			
		}
		catch(err) {			
			const translate = (key) => this._translationService.translate(key);
			// todo: move alternativeShare-Content to new ba-element component
			const alternativeShare = html`<div>
				<label>${translate('share_link_to_share')}:</label>
				<input type="text" value=${urlToShare} readonly></input>
				<ba-button title=${translate('share_copy_to_clipboard')} label=${translate('share_copy_to_clipboard')}></ba-button>
			</div>`;
			const payload = { title: 'Showcase', content:alternativeShare };
			openModal(payload);
		}
	}
} 