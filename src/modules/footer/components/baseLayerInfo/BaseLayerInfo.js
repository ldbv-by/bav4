import { html, nothing } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';

/**
 * a class for displaying information about the base layer
 * @class
 * @author bakir_en
 */
export class BaseLayerInfo extends BaElement {

	constructor() {
		super();
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._georesourceService = GeoResourceService;
	}


	/**
	 * @override
	 */
	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { active, zoom } = state;

		const geoResource = active[0] ? this._georesourceService.byId(active[0].geoResourceId) : null;
		if (!geoResource) {
			return nothing;
		}

		const description = geoResource.getAttribution(zoom)[0].description;
		const label = description ? description : geoResource.label;

		label ? this._content = label : this._content = translate('map_baseLayerInfo_fallback');

		return html`
            <div>${translate('map_baseLayerInfo_label')}: ${this._content} </div>
			`;
	}

	/**
	  * @override
	  * @param {Object} globalState
	  */
	extractState(globalState) {
		const { layers: { active }, position: { zoom } } = globalState;
		return { active, zoom };
	}

	static get tag() {
		return 'ba-base-layer-info';
	}
}
