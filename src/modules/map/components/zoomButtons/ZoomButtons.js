import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './zoomButtons.css';
import { $injector } from '../../../../injection';
import { increaseZoom, decreaseZoom } from '../../store/position.action';

/**
 * Buttons which change the zoom level of the map.
 * @class
 * @author aul
 */
export class ZoomButtons extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);


		return html`
			<style>${css}</style>
			<div class="zoom-buttons">
				<a class="button" title="${translate('map_zoom_in_button')}" @click="${increaseZoom}"><span class="icon zoom-in"></a>
				<a class="button" title="${translate('map_zoom_out_button')}"  @click="${decreaseZoom}"><span class="icon zoom-out"></a>
			</div>
		`;
	}

	static get tag() {
		return 'ba-zoom-buttons';
	}
}