/**
 * @module modules/share/components/dialog/ShareDialogContent
 */
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../injection';
import clipboardIcon from '../../../../assets/icons/clipboard.svg';
import shareIcon from '../../../..//assets/icons/share.svg';
import css from './shareDialogContent.css?inline';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import { isHttpUrl } from '../../../../utils/checks';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';

const Switch_Toggle = 'switch_toggle';
const Update_Clear = 'update_clear';
const Update_Url = 'update_url';
const Update_File_Save_Url = 'update_file_save_url';

const getInfoGraphicShare = (original_text, copy_text) =>
	`<svg version="1.1" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg"><path id="path_original" d="m0.1 40.402h94.8" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><path id="path_copy" d="m94.716 10.901c-32.446 0-42.648 29.497-66.245 29.497l-29.613-0.053213" style="fill:none;stroke-width:2.2297;stroke:currentColor"/><circle id="circle_copy" cx="102.79" cy="10.826" r="8.2623" style="fill:var(--secondary-color);stroke-linecap:round;stroke-linejoin:round"/><circle cx="15.722" cy="40.398" r="8.2623" style="fill:var(--secondary-color)"/><g id="circle_original"><circle id=circle_circle_original cx="102.79" cy="40.398" r="8.2623" style=""/><g transform="matrix(.62516 0 0 .62516 97.514 35.192)" style="fill:var(--text5)"><path d="m7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6a2.24 2.24 0 0 1-0.216-1c0-1.355 0.68-2.75 1.936-3.72a6.3 6.3 0 0 0-1.936-0.28c-4 0-5 3-5 4s1 1 1 1zm-0.716-6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></g></g><text id="text_original" x="116.25132" y="46.129955" style="fill:currentColor;font-family:Sans;font-size:13.333px;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;letter-spacing:0px;line-height:125%;stroke-width:.61246px;word-spacing:0px" xml:space="preserve"><tspan>${original_text}</tspan></text><text id="text_copy" x="116.25132" y="14.129955" style="fill:currentColor;font-family:Sans;font-size:13.333px;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;letter-spacing:0px;line-height:125%;" xml:space="preserve"><tspan>${copy_text}</tspan></text></svg>`;
/**
 * The published urls of a file (FileSaveResult).
 * @typedef {Object} FileSaveUrl
 * @property {string} adminId The url to the adminId version of a file
 * @property {string} fileId The url to the fileId version of a file
 */

/**
 * A content component to show and share urls of
 * user-generated measurement- or drawing-data or the current encoded
 * state of the map
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 * @author costa_gi
 */
export class ShareDialogContent extends MvuElement {
	constructor() {
		super({ checkedToggle: false, url: null, fileSaveUrl: null });
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
			case Update_File_Save_Url:
				return { ...model, fileSaveUrl: data, url: null };
			case Update_Url:
				return { ...model, url: data, fileSaveUrl: null };
			case Update_Clear:
				return { ...model, url: null, fileSaveUrl: null };
		}
	}

	createView(model) {
		const { url, fileSaveUrl } = model;

		if (url || fileSaveUrl) {
			return html`<style>
					${css}
				</style>
				${this._getToggle(model)}
				<div class="share_content">${this._getUrlContent(model)}</div>`;
		}

		return html.nothing;
	}

	_getUrlContent(model) {
		const { checkedToggle, url, fileSaveUrl } = model;
		const getEditableContent = () => this._buildShareItem(fileSaveUrl.adminId);
		const getReadOnlyContent = () => this._buildShareItem(fileSaveUrl.fileId);

		if (url) {
			/**
			 * If only a URL is given, the dialog should only present the link with copy2Clipboard icon.
			 * ShareAPI is not needed, the user have already decided to use only copy2Clipboard.
			 */
			return this._buildShareItem(url, true);
		}
		return checkedToggle === true ? getEditableContent() : getReadOnlyContent();
	}

	_getToggle(model) {
		const translate = (key) => this._translationService.translate(key);
		const { checkedToggle, fileSaveUrl } = model;
		const isToggleNeeded = fileSaveUrl !== null;

		const onToggle = (event) => {
			this.signal(Switch_Toggle, event.detail.checked);
		};

		return isToggleNeeded
			? html`<div class="toggle">
					<h4 class=${checkedToggle ? 'collaborative' : 'copy'}>${translate('share_dialog_link_title')}</h4>
					<div class="share_copy_toggle">
						<ba-switch id="toggle" .checked=${checkedToggle} @toggle=${onToggle}>
							<div class="toggle-content" slot="before">
								<div class="infographic ${checkedToggle ? 'collaborative' : 'copy'}">
									${unsafeHTML(getInfoGraphicShare(translate('share_dialog_infographic_original'), translate('share_dialog_infographic_copy')))}
								</div>
								<span class="share_copy ${checkedToggle ? 'selected' : ''}">${translate('share_dialog_link')}</span>
							</div>
						</ba-switch>
					</div>
				</div>`
			: html.nothing;
	}

	_buildShareItem(url, useOnlyCopyToClipboard = false) {
		const translate = (key) => this._translationService.translate(key);
		const useShareApi = !useOnlyCopyToClipboard && this._environmentService.getWindow().navigator.share ? true : false;

		const getShareApi = () => {
			return html`<ba-icon
				class="share_api"
				.icon=${shareIcon}
				.title=${translate('share_dialog_api')}
				.size=${2}
				@click=${async () => this._shareWithAPI(url)}
			>
			</ba-icon>`;
		};

		const getCopy2Clipboard = () => {
			return html`<ba-icon
				class="share_copy_icon"
				.icon=${clipboardIcon}
				.title=${translate('share_dialog_copy_icon')}
				.size=${2}
				@click=${async () => this._copyValueToClipboard(url)}
			>
			</ba-icon>`;
		};

		return html`
			<div class="share_item share_label">
				<div class="link">
					<input class="share_url" type="text" id="shareurl" name="shareurl" value=${url} readonly />
					${useShareApi ? getShareApi() : nothing}${getCopy2Clipboard()}
				</div>
			</div>
		`;
	}

	async _shareWithAPI(url) {
		const translate = (key) => this._translationService.translate(key);
		try {
			const content = {
				// title-property is absent; browser automatically creates a meaningful title
				url: url
			};
			await this._environmentService.getWindow().navigator.share(content);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				emitNotification(translate('share_dialog_api_failed'), LevelTypes.WARN);
			}
		}
	}

	async _copyValueToClipboard(value) {
		try {
			await this._shareService.copyToClipboard(value);

			emitNotification(
				`${this._translationService.translate('share_clipboard_link_notification_text')} ${this._translationService.translate(
					'share_clipboard_success'
				)}`,
				LevelTypes.INFO
			);
		} catch (error) {
			const message = this._translationService.translate('share_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	/**
	 * sets the urls for the dialog to share
	 * @param {String|FileSaveUrl} value the shared value; wether a plain string (is interpreted as a valid wellformed url) or a FileSaveUrl-Object
	 */
	set urls(value) {
		if (isHttpUrl(value)) {
			this.signal(Update_Url, value);
		} else if (value.fileId && value.adminId) {
			this.signal(Update_File_Save_Url, value);
		} else {
			this.signal(Update_Clear);
		}
	}

	static get tag() {
		return 'ba-share-content';
	}
}
