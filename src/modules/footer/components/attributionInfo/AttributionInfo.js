import { html, nothing } from 'lit-html'; 
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';

/**
 * a class for displaying the attribution of the basemap
 * @class
 * @author bakir_en 
 */
export class AttributionInfo extends BaElement {

	constructor() {
		super();
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._georesourceService = GeoResourceService;
		this._content = null;
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
			// Not yet implemented
			this._content = geoResource.attribution;

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
		return 'ba-attribution-info';
	} 
} 