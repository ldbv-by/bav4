import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './iframegenerator.css';

/**
 * Size in pixel of a iframe component
 * Usually it contains at least a label and an array of numbers
 * for the with and height values.
 * @typedef IFrameSize
 * @property {string} label
 * @property {Array<number|null} value description
 */

const Update_Disclaimer_Accepted = 'update_disclaimer_accepted';

const Iframe_Placeholder = '<div class="iframe__placeholder"></div>';

/**
 * Component to preview the embeded version
 *
 * @author thiloSchlemmer
 */
export class IFrameGenerator extends MvuElement {
	constructor() {
		super({
			size: { label: 'default', value: [400, 300] },
			disclaimerAccepted: false
		});
		const { TranslationService: translationService, ShareService: shareService } = $injector.inject('TranslationService', 'ShareService');
		this._translationService = translationService;
		this._shareService = shareService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Disclaimer_Accepted:
				return {
					...model,
					disclaimerAccepted: data
				};
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { size, disclaimerAccepted } = model;
		const width = size.value[0];
		const height = size.value[1];


		const translate = (key) => this._translationService.translate(key);

		const onToggle = (event) => {
			this.signal(Update_Disclaimer_Accepted, event.detail.checked);
		};
		const getContent = disclaimerAccepted ? this._getIFrameContent(width, height) : Iframe_Placeholder;

		return html`
		<style>${css}</style>
        <div class='iframe__body'>${getContent()}</div>
        <div class='iframe__disclaimer'>
            <ba-checkbox .checked=${disclaimerAccepted} .title=${translate('iframe_embed_disclaimer_title')} @toggle=${onToggle}>${translate('iframe_embed_disclaimer_text')}</ba-checkbox>
        </div>`;
	}

	_getIFrameContent(width, height) {
		const baseUrl = this._shareService.encodeState();
		const embedUrl = baseUrl.replace('/index.html', '/embed.html');
		return html`<iframe class="iframe___content" src=${embedUrl} width=${width} height=${height} loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
	}

	static get tag() {
		return 'ba-iframe-generator';
	}
}
