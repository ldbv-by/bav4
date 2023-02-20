import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import clipboardIcon from './assets/clipboard.svg';
import css from './iframegenerator.css';


const Update_Size_Width = 'update_size_width';
const Update_Size_Height = 'update_size_height';

/**
 * Component to preview the embeded version
 *
 * @author thiloSchlemmer
 */
export class IFrameGenerator extends MvuElement {
	constructor() {
		super({
			size: [400, 300]
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
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { size } = model;
		const width = size[0];
		const height = size[1];


		const translate = (key) => this._translationService.translate(key);

		const onChangeWidth = (event) => {
			this.signal(Update_Size_Width, event.target.value);
		};
		const onChangeHeight = (event) => {
			this.signal(Update_Size_Height, event.target.value);
		};


		return html`
		<style>${css}</style>
        <div class='iframe__body'>${this._getIFrameContent(width, height)}</div>
        <div class='iframe__controls'>
			<div class="fieldset">						
						<input type="text" required="required" id="iframe_width" value=${width}  @input=${onChangeWidth}></input>
						<label for="iframe_width" class="control-label">${translate('iframe_generator_width')}</label>			
			</div>
			<div class="fieldset">						
						<input type="text" required="required" id="iframe_height" value=${height} @input=${onChangeHeight}></input>
						<label for="iframe_height" class="control-label">${translate('iframe_generator_height')}</label>			
			</div>
        </div>`;
	}

	_getIFrameContent(width, height) {
		const translate = (key) => this._translationService.translate(key);
		const location = this._environmentService.getWindow().location;
		const baseLocation = `${location.protocol}//${location.host}${location.pathname}` + '?';
		const embedLocation = `${location.protocol}//${location.host}${location.pathname}embed.html` + '?';
		const baseUrl = this._shareService.encodeState();
		const previewUrl = baseUrl.replace(baseLocation, embedLocation);
		const embedString = `<iframe src=${previewUrl} width=${width} height=${height} loading="lazy"  frameborder='0' style='border:0'></iframe>`;

		const onCopyHTMLToClipBoard = async () => this._copyValueToClipboard(embedString);

		return html`
		<div class='iframe__embed_string'>
			<input value=${embedString} readonly></input>
			<ba-icon class='share_copy' .icon='${clipboardIcon}' .title=${translate('iframe_copy_icon')} .size=${2} @click=${onCopyHTMLToClipBoard}>
			</ba-icon>
		</div>
		<iframe class="iframe___content" src=${previewUrl} width=${width} height=${height} loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
	}

	static get tag() {
		return 'ba-iframe-generator';
	}
}
