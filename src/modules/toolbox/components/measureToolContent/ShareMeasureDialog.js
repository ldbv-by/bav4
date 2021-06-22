import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import css from './shareMeasureDialog.css';

export class ShareMeasureDialog extends BaElement {

	constructor() {
		super();
		const { TranslationService: translationService, EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('TranslationService', 'EnvironmentService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._shareUrls = null;
	}


	createView() {
		const translate = (key) => this._translationService.translate(key);
		
		if (this._shareUrls) {

			const editableContent = this._buildShareItem(this._shareUrls.adminId, translate('toolbox_measureTool_share_link_readonly'));
			const readOnlyContent = this._buildShareItem(this._shareUrls.fileId, translate('toolbox_measureTool_share_link_edit'));

			return html`
			<style>${css}</style>
            <div class='share_content'>
                ${editableContent}
                ${readOnlyContent}
            </div>`;
		}
		
		return html.nothing;
	}

	_buildShareItem(url, label) {
		const onCopyUrlToClipBoard = async () => this._copyValueToClipboard(url);

		return html`
        <div class='share_item'>
            <span class share_label>${label}</span>
            <input class='share_url' type='text' id='shareurl' name='shareurl' value=${url} readonly>							
            <ba-icon class='close' icon='${clipboardIcon}' title=${label} size=1.5} @click=${onCopyUrlToClipBoard}>
            </ba-icon>
        </div>
    `;
	}

	async _copyValueToClipboard(value) {
		await this._shareService.copyToClipboard(value).then(() => { }, () => {
			console.warn('Clipboard API not available');
		});
	}

	set shareurls(value) {
		this._shareUrls = value;
		this.render();
	}

	static get tag() {
		return 'ba-sharemeasure';
	}
}
