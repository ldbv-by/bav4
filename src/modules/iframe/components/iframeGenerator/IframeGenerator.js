import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import { PathParameters } from '../../../../domain/pathParameters';
import clipboardIcon from './assets/clipboard.svg';
import css from './iframegenerator.css';
import { IFRAME_ENCODED_STATE } from '../../../../utils/markup';

const Update_Size_Width = 'update_size_width';
const Update_Size_Height = 'update_size_height';
const Update_Auto_Width = 'update_auto_width';
const Update_Preview_Url = 'update_preview_url';

const Auto_Width = '100%';
const Range_Min = 100;
const Range_Max = 2000;

/**
 * Component to preview the embedded version
 *
 * @author thiloSchlemmer
 * @author alsturm
 */
export class IframeGenerator extends MvuElement {
	constructor() {
		super({
			size: [800, 600],
			autoWidth: false,
			previewUrl: null
		});
		const { TranslationService: translationService, ShareService: shareService } = $injector.inject('TranslationService', 'ShareService');
		this._translationService = translationService;
		this._shareService = shareService;
		this._iframeObserver = null;
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
			case Update_Preview_Url:
				return { ...model, previewUrl: data };
		}
	}

	onAfterRender(firstTime) {
		if (firstTime) {
			const iframeElement = this.shadowRoot.querySelector('iframe');
			const config = { attributes: true, childList: false, subtree: false };
			this._iframeObserver = new MutationObserver((mutationList) => this._onIFrameChanged(mutationList));
			this._iframeObserver.observe(iframeElement, config);
		}
	}

	onDisconnect() {
		this._iframeObserver?.disconnect();
		this._iframeObserver = null;
	}

	/**
	 * @override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { size, autoWidth, previewUrl } = model;
		const [width, height] = size;

		const onChangeWidth = (event) => {
			this.signal(Update_Size_Width, parseInt(event.target.value));
		};
		const onChangeHeight = (event) => {
			this.signal(Update_Size_Height, parseInt(event.target.value));
		};

		const onChangeSliderWidth = (event) => {
			this.signal(Update_Size_Width, parseInt(event.target.value));
		};
		const onChangeSliderHeight = (event) => {
			this.signal(Update_Size_Height, parseInt(event.target.value));
		};

		const onToggleAutoWidth = (event) => {
			this.signal(Update_Auto_Width, event.detail.checked);
		};

		const getWidthFieldset = () => {
			return autoWidth
				? html`<div class="fieldset">
						<div class="iframe__input">${Auto_Width}</div>
						<label for="iframe_width" class="control-label">${translate('iframe_generator_width')}</label>
				  </div>`
				: html`<div class="fieldset">						
			<div class='iframe__input'>
			<input type="number" id="iframe_width" .value=${width} min=${Range_Min} max=${Range_Max} @input=${onChangeWidth}></input>Pixel
			</div>
			<input type="range" id="iframe_slider_width" step=10 min=${Range_Min} max=${Range_Max} .value=${width} @input=${onChangeSliderWidth}>
			<label for="iframe_width" class="control-label">${translate('iframe_generator_width')}</label>			
		</div>`;
		};

		const currentWidth = autoWidth ? Auto_Width : width;
		return html`
		<style>${css}</style>		
        <div class='container'>
			<div class='iframe__controls'>
			<div class='iframe__controls-section'>
				<div class='iframe__toggle'>
					<span class='iframe__toggle_text'>${translate('iframe_generator_toggle_label')}</span>
					<ba-toggle id='toggleAutoWidth' .title=${translate('iframe_generator_toggle_title')} @toggle=${onToggleAutoWidth}></ba-toggle>
				</div>
				${getWidthFieldset()}
				<div class="fieldset">						
					<div class='iframe__input'><input type="number" .value=${height} min=${Range_Min} max=${Range_Max} id="iframe_height" @input=${onChangeHeight}></input>Pixel</div>
					<input type="range" id="iframe_slider_height" .value=${height} step=10 min=${Range_Min} max=${Range_Max} @input=${onChangeSliderHeight}>
					<label for="iframe_height" class="control-label">${translate('iframe_generator_height')}</label>			
				</div>
				</div>
				<div class='iframe__controls-section'>
				<div class='iframe__code'>${this._getEmbedContent(currentWidth, height, previewUrl)}</div>
				</div>
				</div>
			<div class='iframe__preview'>${this._getIFrameContent(currentWidth, height)}</div>
		</div>
        `;
	}

	_onIFrameChanged(mutationList) {
		for (const mutation of mutationList) {
			if (mutation.type === 'attributes' && mutation.attributeName === IFRAME_ENCODED_STATE) {
				this.signal(Update_Preview_Url, mutation.target.getAttribute(IFRAME_ENCODED_STATE));
			}
		}
	}

	_getIFrameContent(width, height) {
		const iframeSrc = this._shareService.encodeState({}, [PathParameters.EMBED]);
		return html` <div class="iframe__content">
			<iframe
				data-iframe-encoded-state
				src=${iframeSrc}
				width=${width === Auto_Width ? Auto_Width : width + 'px'}
				height=${height + 'px'}
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
			></iframe>
		</div>`;
	}

	_getEmbedContent(width, height, previewUrl) {
		const translate = (key) => this._translationService.translate(key);

		const getEmbedCode = () => {
			return `<iframe src=${previewUrl ? previewUrl : this._shareService.encodeState({}, [PathParameters.EMBED])} width='${
				width === Auto_Width ? Auto_Width : width + 'px'
			}' height='${height + 'px'}' loading='lazy' frameborder='0' style='border:0'></iframe>`;
		};

		const onCopyHTMLToClipBoard = async () => {
			return this._copyValueToClipboard(getEmbedCode());
		};

		return html`<textarea class="iframe__code_string" id="iframe_code" name="iframe_code" .value=${getEmbedCode()} readonly></textarea>
			<ba-icon
				class="iframe__copy_icon"
				id="iframe_code_copy"
				.icon="${clipboardIcon}"
				.title=${translate('iframe_generator_copy_icon')}
				.size=${2}
				@click=${onCopyHTMLToClipBoard}
			>
			</ba-icon>`;
	}

	async _copyValueToClipboard(value) {
		try {
			await this._shareService.copyToClipboard(value);
			emitNotification(`${this._translationService.translate('iframe_generator_clipboard_success')}`, LevelTypes.INFO);
		} catch (error) {
			console.warn('Clipboard API not available');
			emitNotification(`${this._translationService.translate('iframe_generator_clipboard_error')}`, LevelTypes.WARN);
		}
	}

	static get tag() {
		return 'ba-iframe-generator';
	}
}
