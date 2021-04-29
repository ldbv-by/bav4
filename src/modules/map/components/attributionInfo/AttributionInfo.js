import { html } from 'lit-html'; 
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

		const attributionsRaw = new Array(); 

		for (const layer of active)  {
			if (!layer.visible) {
				continue;
			} 
			
			const geoResource = this._georesourceService.byId(layer.id);

			if (!geoResource) {
				continue;
			} 

			attributionsRaw.push(geoResource.getAttribution(zoom));
		}


		// render fallback if no layers are set or visible
		if (attributionsRaw[0] === null || attributionsRaw[0] === undefined) {
			return html`
            		<div>${translate('map_attributionInfo_fallback')}</div>
				`;
		}
		
		// eliminate duplicates, without stringify Set() doesn't detect duplicates in this case  
		const attributions = Array.from(new Set(attributionsRaw.map(JSON.stringify)), JSON.parse);		

		const attributionCopyright = [] ;

		attributions.forEach((attribution, index) => {
			attribution.forEach((element) => {
				if (element.copyright.url  != null) {
					attributionCopyright.push(html`<a class='attribution-link' target='new' href=${element.copyright.url} > ${element.copyright.label}</a>`);
				}
				else {
					attributionCopyright.push(html` ${element.copyright.label}`);
				} 
				if (index < attributions.length - 1) {
					attributionCopyright.push(html`, `);
				} 
			}); 
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