import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import shareIcon from './assets/share.svg';
import css from './shareDialogContent.css';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';

const Switch_Toggle = 'switch_toggle';
const Update_Share_Urls = 'update_share_urls';

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
		super({ checkedToggle: false, shareUrls: null });
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			ShareService: shareService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
	}

	update(type, data, model) {
		switch (type) {
			case Switch_Toggle:
				return { ...model, checkedToggle: data };
			case Update_Share_Urls:
				return { ...model, shareUrls: data };
		}
	}

	createView(model) {
		const { shareUrls } = model;

		if (shareUrls) {
			return html`<style>
					${css}
				</style>
				${this._getToggle(model)}
				<div class="share_content">${this._getUrlContent(model)}</div>`;
		}

		return html.nothing;
	}

	_getUrlContent(model) {
		const { checkedToggle, shareUrls } = model;
		const getEditableContent = () => this._buildShareItem(shareUrls.adminId);
		const getReadOnlyContent = () => this._buildShareItem(shareUrls.fileId);

		if (shareUrls.fileId && shareUrls.adminId) {
			return checkedToggle === true ? getEditableContent() : getReadOnlyContent();
		}
		if (shareUrls.adminId) {
			return getEditableContent();
		}
		return getReadOnlyContent();
	}

	_getToggle(model) {
		const translate = (key) => this._translationService.translate(key);
		const { checkedToggle, shareUrls } = model;
		const isToggleNeeded = shareUrls.fileId && shareUrls.adminId;

		const onToggle = (event) => {
			this.signal(Switch_Toggle, event.detail.checked);
		};

		return isToggleNeeded
			? html`<div class="toggle">
					<ba-toggle id="toggle" .checked=${checkedToggle} .title=${'Toggle'} @toggle=${onToggle}></ba-toggle>
					<span class="share_copy">${translate('toolbox_measureTool_share_link')}</span>
			  </div>`
			: html.nothing;
	}

	_buildShareItem(url) {
		const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;

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
					} catch (error) {
						console.error('Share-API failed:', error);
					}
				};
				return html`<ba-icon
					class="share_api"
					.icon="${shareIcon}"
					.title=${translate('toolbox_measureTool_share_api')}
					.size=${2}
					@click=${onClickWithApi}
				>
				</ba-icon>`;
			}
			return html`<ba-icon
				class="share_copy"
				.icon="${clipboardIcon}"
				.title=${translate('toolbox_copy_icon')}
				.size=${2}
				@click=${onCopyUrlToClipBoard}
			>
			</ba-icon>`;
		};

		const shareApiContent = getShareApiContent(useShareApi);

		return html`
			<div class="share_item share_label">
				<div class="link">
					<input class="share_url" type="text" id="shareurl" name="shareurl" value=${url} readonly />
					${shareApiContent}
				</div>
			</div>
		`;
	}

	async _copyValueToClipboard(value) {
		try {
			await this._shareService.copyToClipboard(value);
			emitNotification(
				`${this._translationService.translate('toolbox_clipboard_link_notification_text')} ${this._translationService.translate(
					'toolbox_clipboard_success'
				)}`,
				LevelTypes.INFO
			);
		} catch (error) {
			const message = this._translationService.translate('toolbox_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	set shareurls(value) {
		const newUrls = value.fileId || value.adminId ? value : null;
		this.signal(Update_Share_Urls, newUrls);
	}

	static get tag() {
		return 'ba-share-content';
	}
}
