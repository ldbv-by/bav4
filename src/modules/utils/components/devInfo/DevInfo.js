/**
 * @module modules/utils/components/devInfo/DevInfo
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import css from './devInfo.css';
import { openModal } from '../../../../store/modal/modal.action';
import { MvuElement } from '../../../MvuElement';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import clipboardIcon from '../../../../assets/icons/clipboard.svg';

/**
 * Displays the `SOFTWARE_VERSION` and `SOFTWARE_INFO` value, which should
 * contain development information like build number, date, ...
 * @class
 * @author taulinger
 */
export class DevInfo extends MvuElement {
	#shareService;
	#translationService;

	constructor() {
		super();

		const {
			ConfigService: configService,
			TranslationService: translationService,
			ShareService: shareService
		} = $injector.inject('ConfigService', 'TranslationService', 'ShareService');

		this._configService = configService;
		this.#translationService = translationService;
		this.#shareService = shareService;
	}

	isRenderingSkipped() {
		return !this._configService.getValue('SOFTWARE_INFO', false);
	}

	createView() {
		const info = `v${this._configService.getValue('SOFTWARE_VERSION')} - ${this._configService.getValue('SOFTWARE_INFO')}`;
		const translate = (key) => this.#translationService.translate(key);

		const onShowcaseButtonClick = () => {
			openModal('Showcase', html`<ba-showcase></ba-showcase>`);
		};

		const OnCopyBuildInfoToClipboard = () => {
			this._copyToClipboard(info);
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<span class="build-info">
					<ba-button
						@click=${onShowcaseButtonClick}
						.size=${2.0}
						.label=${info}
						.title=${translate('devInfo_open_showcase_modal')}
						.type=${'secondary'}
					></ba-button>
					<span class="separator"></span>
					<ba-icon
						class="copy-to-clipboard"
						.icon=${clipboardIcon}
						.title=${translate('devInfo_copy_to_clipboard_title')}
						.size=${1.5}
						@click=${OnCopyBuildInfoToClipboard}
					></ba-icon>
				</span>
			</div>
		`;
	}

	static get tag() {
		return 'ba-dev-info';
	}

	async _copyToClipboard(string) {
		try {
			await this.#shareService.copyToClipboard(string);
			emitNotification(this.#translationService.translate('devInfo_copy_to_clipboard_success'), LevelTypes.INFO);
		} catch {
			emitNotification(this.#translationService.translate('devInfo_copy_to_clipboard_error'), LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}
}
