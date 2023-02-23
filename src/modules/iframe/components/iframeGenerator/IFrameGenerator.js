import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import clipboardIcon from './assets/clipboard.svg';
import css from './iframegenerator.css';


const Update_Size_Width = 'update_size_width';
const Update_Size_Height = 'update_size_height';
const Update_Auto_Width = 'update_auto_width';

const Auto_Width = '100%';

/**
 * Component to preview the embedded version
 *
 * @author thiloSchlemmer
 */
export class IFrameGenerator extends MvuElement {
	constructor() {
		super({
			size: ['400px', '300px'],
			autoWidth: false
		});
		const { TranslationService: translationService, ShareService: shareService, EnvironmentService: environmentService } = $injector.inject('TranslationService', 'ShareService', 'EnvironmentService');
		this._translationService = translationService;
		this._shareService = shareService;
		this._environmentService = environmentService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Size_Width:
				return {
					...model,
					size: [data, model.size[1]]
				};
			case Update_Size_Height:
				return {
					...model,
					size: [model.size[0], data]
				};
			case Update_Auto_Width:
				return {
					...model,
					autoWidth: data
				};
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { size, autoWidth } = model;
		const [width, height] = size;

		const onChangeWidth = (event) => {
			this.signal(Update_Size_Width, event.target.value);
		};
		const onChangeHeight = (event) => {
			this.signal(Update_Size_Height, event.target.value);
		};

		const onToggleAutoWidth = (event) => {
			this.signal(Update_Auto_Width, event.detail.checked);
		};

		const currentWidth = autoWidth ? Auto_Width : width;

		return html`
		<style>${css}</style>		
        <div class='iframe__preview'>${this._getIFrameContent(currentWidth, height)}</div>
		<div class='iframe__controls'>
			<div class='iframe__toggle'>
				<span class='iframe__toggle_text'>${translate('iframe_generator_toggle_label')}</span>
				<ba-toggle id='toggleAutoWidth' .title=${translate('iframe_generator_toggle_title')} @toggle=${onToggleAutoWidth}></ba-toggle>
			</div>
			<div class="fieldset">						
				<input type="text" required="required" id="iframe_width" ?readonly=${autoWidth} value=${autoWidth ? '' : currentWidth}  @input=${onChangeWidth}></input>
				<label for="iframe_width" class="control-label">${translate('iframe_generator_width')}</label>			
			</div>
			<div class="fieldset">						
				<input type="text" required="required" id="iframe_height" value=${height} @input=${onChangeHeight}></input>
				<label for="iframe_height" class="control-label">${translate('iframe_generator_height')}</label>			
			</div>
        </div>
		<div class='iframe__code'>${this._getEmbedContent(currentWidth, height)}</div>
        `;
	}

	_getIFrameContent(width, height) {
		const previewUrl = this._getEmbeddedEncodedState();
		return html`
		<div class="iframe___content">
			<iframe src=${previewUrl} width=${width} height=${height} loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
		</div>`;
	}

	_getEmbedContent(width, height) {
		const translate = (key) => this._translationService.translate(key);
		const previewUrl = this._getEmbeddedEncodedState();

		const embedString = `<iframe src=${previewUrl} width='${width}' height='${height}' loading='lazy' frameborder='0' style='border:0'></iframe>`;

		const onCopyHTMLToClipBoard = async () => this._copyValueToClipboard(embedString);

		return html`<ba-button id='iframe-button' .label=${translate('iframe_generate_code_label')}  .icon=${clipboardIcon} .type=${'primary'} @click=${onCopyHTMLToClipBoard}></ba-button>`;
	}

	async _copyValueToClipboard(value) {
		try {
			await this._shareService.copyToClipboard(value);
			emitNotification(`${this._translationService.translate('iframe_embed_clipboard_success')}`, LevelTypes.INFO);
		}
		catch (error) {
			emitNotification(this._translationService.translate('iframe_embed_clipboard_error'), LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	// todo: move to ShareService
	_getEmbeddedEncodedState() {
		const location = this._environmentService.getWindow().location;
		const baseLocation = `${location.protocol}//${location.host}${location.pathname}` + '?';
		const embedLocation = `${location.protocol}//${location.host}${location.pathname}embed.html` + '?';
		const baseUrl = this._shareService.encodeState();
		return baseUrl.replace(baseLocation, embedLocation);
	}

	static get tag() {
		return 'ba-iframe-generator';
	}
}
