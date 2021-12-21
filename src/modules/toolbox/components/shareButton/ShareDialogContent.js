import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import shareIcon from './assets/share.svg';
import css from './shareDialogContent.css';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';

const Switch_Toggle = 'switch_toggle';

/**
 * A content component to show and share perma-links of
 * user-generated measurement- or drawing-data
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 * @author costa_gi
 */
export class ShareDialogContent extends MvuElement {

	constructor() {
		super({ checkedToggle: false });
		const { TranslationService: translationService, EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('TranslationService', 'EnvironmentService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._shareUrls = null;
	}

	update(type, data, model) {
		switch (type) {
			case Switch_Toggle:
				return { ...model, checkedToggle: data };
		}
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { checkedToggle } = model;

		if (this._shareUrls) {
			const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;

			const editableContent = this._buildShareItem(this._shareUrls.adminId, useShareApi);
			const readOnlyContent = this._buildShareItem(this._shareUrls.fileId, useShareApi);
			const urlContent = checkedToggle === true ? editableContent : readOnlyContent;

			const onToggle = (event) => {
				this.signal(Switch_Toggle, event.detail.checked);
			};

			return html`
			<style>${css}</style>
			<div class='toggle' style="display: flex;justify-content: flex-start;">
			<ba-toggle id='toggle' .checked=${checkedToggle} .title=${'Toggle'} @toggle=${onToggle}></ba-toggle>
			<span class='share_copy'>${translate('toolbox_measureTool_share_link')}</span>
			</div>
            <div class='share_content'>
				${urlContent} 
            </div>`;
		}

		return html.nothing;
	}

	_buildShareItem(url, useShareApi) {
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
			return html`<ba-icon class='share_copy' .icon='${clipboardIcon}' .title=${translate('toolbox_copy_icon')} .size=${2} @click=${onCopyUrlToClipBoard}>
            </ba-icon>`;
		};

		const shareApiContent = getShareApiContent(useShareApi);

		return html`
        <div class='share_item share_label'>
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
			emitNotification(`${this._translationService.translate('toolbox_clipboard_link_notification_text')} ${this._translationService.translate('toolbox_clipboard_success')}`, LevelTypes.INFO);
		}
		catch (error) {
			const message = this._translationService.translate('toolbox_clipboard_error');
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
