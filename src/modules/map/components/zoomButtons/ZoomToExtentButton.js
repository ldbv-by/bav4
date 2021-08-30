import { html } from 'lit';
import { BaElement } from '../../../BaElement';
import css from './zoomToExtentButton.css';
import { $injector } from '../../../../injection';
import { setFit } from '../../../../store/position/position.action';

/**
 * Button that zooms map to extent
 * @class
 * @author bakir_en
 */

export class ZoomToExtentButton extends BaElement {

	constructor() {
		super();
		const { TranslationService, MapService } = $injector.inject('TranslationService', 'MapService');
		this._translationService = TranslationService;
		this._mapService = MapService;
	}

	/**
     *@override
     */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const getDefaultMapExtent = () => this._mapService.getDefaultMapExtent();

		const zoomToExtent = () => {
			setFit(getDefaultMapExtent());
		};

		return html`
            <style>${css}</style>
			<div class="zoom-to-extent">
				<button class="zoom-to-extent-button" @click=${zoomToExtent} title="${translate('map_zoomButtons_extent')}" ><i class="icon zoom-to-extent-icon"></i></button>
            </div>
            
        `;
	}

	static get tag() {
		return 'ba-extent-button';
	}
}
