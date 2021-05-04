import { html } from 'lit-html'; 
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
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
		this._isOpen = false;
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
		
		const toggleOpen = () => {		
			this._isOpen = !this._isOpen;
			this.render();
		};

		const classes = {
			isopen:this._isOpen,
		};

		// eliminate duplicates, without stringify Set() doesn't detect duplicates in this case  
		const attributions = Array.from(new Set(attributionsRaw.map(JSON.stringify)), JSON.parse);		

		const attributionCopyright = [] ;

		attributions.forEach((attribution, index) => {
			// we have to check if 'attribution' is an array, otherwise the 'forEach'-function throws an error
			if (Array.isArray(attributions[0])) {
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
			}	
		});
		const getCollapseClass = () => {
			return attributionCopyright.length > 1 ? 'is-collapse' : '';
		};

		return html`
			<style>${css}</style>
            <div class='attribution-container ${classMap(classes)}'>
				© ${translate('map_attributionInfo_label')}: 
				${attributionCopyright} 
				<div @click=${toggleOpen} class="collapse-button ${getCollapseClass()}" title="${translate('map_attributionInfo_collapse_title')}">
				<i class="icon chevron  "></i>
				</div>
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