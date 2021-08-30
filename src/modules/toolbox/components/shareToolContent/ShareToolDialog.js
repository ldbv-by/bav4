import { html } from 'lit';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import css from './shareToolDialog.css';

/**
 * @class
 * @author bakir_en
 * @author alsturm
 */
export class ShareToolDialog extends BaElement {

	constructor() {
		super();
		const { TranslationService: translationService, ShareService: shareService } = $injector.inject('TranslationService', 'ShareService');
		this._translationService = translationService;
		this._shareService = shareService;
		this._shareUrl = null;

	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		if (this._shareUrl) {

			const dialogContent = this._buildShareItem(this._shareUrl, translate('toolbox_shareTool_share_link_readonly'));

			return html`
			<style>${css}</style>
            <div class='share_item'>
                ${dialogContent}
            </div>`;
		}

		return html.nothing;

	}

	_buildShareItem(url, label) {
		const translate = (key) => this._translationService.translate(key);
		const onCopyUrlToClipBoard = async () => this._copyValueToClipboard(url);

		return html`
		<div class='share_label'>${label}</div>			
			<div class='link'>
            	<input class='share_url' type='text' id='shareurl' name='shareurl' value=${url} readonly>							
				<ba-icon class='share_copy' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=2} @click=${onCopyUrlToClipBoard}></ba-icon>
			</div>            
    `;
	}

	async _copyValueToClipboard(value) {
		await this._shareService.copyToClipboard(value).then(() => { }, () => {
			console.warn('Clipboard API not available');
		});
	}

	set shareUrl(value) {
		this._shareUrl = value;
		this.render();
	}

	static get tag() {
		return 'ba-sharetool-dialog';
	}
}
