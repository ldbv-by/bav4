import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import shareIcon from './assets/share.svg';
import css from './shareDialogContent.css';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

/**
 * A content component to show and share perma-links of
 * user-generated measurement- or drawing-data
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 * @author costa_gi
 */
export class ShareDialogContent extends BaElement {

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
			const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;

			const editableContent = this._buildShareItem(this._shareUrls.adminId, translate('toolbox_measureTool_share_link_readonly'), useShareApi);
			const readOnlyContent = this._buildShareItem(this._shareUrls.fileId, translate('toolbox_measureTool_share_link_edit'), useShareApi);

			return html`
			<style>${css}</style>
            <div class='share_content'>
                ${editableContent}
                ${readOnlyContent}
            </div>`;
		}

		return html.nothing;
	}

	_buildShareItem(url, label, useShareApi) {
		const translate = (key) => this._translationService.translate(key);
		const onCopyUrlToClipBoard = async () => this._copyValueToClipboard(url);

		const getShareApiContent = (useShareApi) => {
			if (useShareApi) {
				const onClickWithApi = async () => {
					try {
						await this._environmentService.getWindow().navigator.share({
							title: translate('toolbox_measureTool_share_link_title'),
							url: url
						});
					}
					catch (error) {
						console.error('Share-API failed:', error);
					}
				};
				return html`<ba-icon class='share_api' .icon='${shareIcon}' .title=${translate('toolbox_measureTool_share_api')} .size=${2} @click=${onClickWithApi}>
				</ba-icon>`;
			}
			return html`<ba-icon class='share_copy' .icon='${clipboardIcon}' .title=${translate('map_contextMenuContent_copy_icon')} .size=${2} @click=${onCopyUrlToClipBoard}>
            </ba-icon>`;
		};

		const shareApiContent = getShareApiContent(useShareApi);

		return html`
        <div class='share_item'>
			<div class='share_label'>${label}</div>			
			<div class='link'>
				<input class='share_url' type='text' id='shareurl' name='shareurl' value=${url} readonly>							           
				${shareApiContent}
			</div>
        </div>
    `;
	}

	async _copyValueToClipboard(value) {
		try {
			await this._shareService.copyToClipboard(value);
			emitNotification(`${this._translationService.translate('toolbox_clipboard_link_notification_text')} ${this._translationService.translate('map_contextMenuContent_clipboard_success')}`, LevelTypes.INFO);
		}
		catch (error) {
			const message = this._translationService.translate('map_contextMenuContent_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	set shareurls(value) {
		this._shareUrls = value;
		this.render();
	}

	static get tag() {
		return 'ba-share-content';
	}
}
