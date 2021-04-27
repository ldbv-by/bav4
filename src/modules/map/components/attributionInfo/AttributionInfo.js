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

		const geoResource = active[0] ?  this._georesourceService.byId(active[0].id) : null;

		if (!geoResource) {
			return nothing;
		} 

		const attributions = geoResource.getAttribution(zoom);

		if (!attributions) {
			return html`
            		<div>${translate('map_attributionInfo_fallback')}</div>
				`;
		}

		const attributionCopyright = [] ;

		attributions.forEach((attribution, index) => {
			if (attribution.copyright.url  != null) {
				attributionCopyright.push(html`<a class='attribution-link' target='new' href=${attribution.copyright.url} > ${attribution.copyright.label}</a>`);
			}
			else {
				attributionCopyright.push(html` ${attribution.copyright.label}`);
			} 
			if (index < attributions.length - 1) {
				attributionCopyright.push(html`, `);
			} 
		});

		return html`
			<style>${css}</style>
            <div class='attribution-container'>
				© ${translate('map_attributionInfo_label')}: 
				${attributionCopyright} 
			</div>
			`;
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