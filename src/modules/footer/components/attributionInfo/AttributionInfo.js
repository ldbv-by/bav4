import { html, nothing } from 'lit-html'; 
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './attributionInfo.css';

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
	} 


	/**
     * @override 
     */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { active, zoom } = this._state;

		if (typeof active !== undefined && active.length > 0) {

			const geoResource = this._georesourceService.byId(active[0].id);

			if (!geoResource) {
				return nothing;
			} 

			const attributions = geoResource.getAttribution(zoom);

			if (!attributions) {
				return html`
            		<div><p>${translate('map_attributionInfo_fallback')}</p></div>
				`;
			}

			const attributionCopyright = [] ;
			const attributionsLength = attributions.length;

			attributions.forEach((attribution, index) => {
				if (attribution.copyright.url  != null) {
					if (index < attributionsLength - 1) {
						attributionCopyright.push(html`<a class='attribution-link' target='new' href=${attribution.copyright.url} > ${attribution.copyright.label}, </a>`);
					}
					else {
						attributionCopyright.push(html`<a class='attribution-link' target='new' href=${attribution.copyright.url} > ${attribution.copyright.label} </a>`);
					} 
				}
				else if (attribution.copyright.label != null) {
					if (index < attributionsLength - 1) {
						attributionCopyright.push(html`<p class='attribution-label'> ${attribution.copyright.label}, </p>`);
					}
					else {
						attributionCopyright.push(html`<p class='attribution-label'> ${attribution.copyright.label} </p>`);
					} 
				} 
			});
			
			// At least the first element should not be null
			if (attributionCopyright[0] === null || attributionCopyright[0] === undefined) {
				return html`
            		<div><p>${translate('map_attributionInfo_fallback')}</p></div>
				`;
			}

			return html`
			<style>${css}</style>
            <div class='attribution-container'>
				<p>${translate('map_attributionInfo_label')}: </p>
				${attributionCopyright} 
			</div>
			`;
		} 

		return nothing;
	} 

	/**
	  * @override
	  * @param {Object} state 
	  */
	extractState(state) {
		const { layers: { active }, position: { zoom } } = state;
		return { active, zoom };
	}

	static get tag() {
		return 'ba-attribution-info';
	} 
} 