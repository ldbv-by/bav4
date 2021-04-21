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
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { active } = this._state;

		if (typeof active !== undefined && active.length > 0) {
			const geoResource = this._georesourceService.byId(active[0].id);
			if (!geoResource) {
				return nothing;
			} 
			geoResource.label ? this._content = geoResource.label : this._content = translate('map_baseLayerInfo_fallback');
			
			return html`
            <div><p>${translate('map_baseLayerInfo_label')}: ${this._content} </p></div>
			`;
		} 

		return nothing;
	} 

	/**
	  * @override
	  * @param {Object} state 
	  */
	extractState(state) {
		const { layers: { active } } = state;
		return { active };
	}

	static get tag() {
		return 'ba-base-layer-info';
	} 
}