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
	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { active, zoom } = state;

		const attributionsRaw = new Array();

		for (const layer of active) {
			if (!layer.visible) {
				continue;
			}

			const geoResource = this._georesourceService.byId(layer.geoResourceId);

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
			isopen: this._isOpen
		};

		// eliminate duplicates, without stringify Set() doesn't detect duplicates in this case
		const attributions = Array.from(new Set(attributionsRaw.map(JSON.stringify)), JSON.parse);

		const attributionCopyright = [];

		attributions.forEach((attribution, index) => {
			// we have to check if 'attribution' is an array, otherwise the 'forEach'-function throws an error
			if (Array.isArray(attributions[0])) {
				attribution.forEach((element) => {
					const separator = index === attributions.length - 1 ? '' : ',';
					attributionCopyright.push(element.copyright.url != null ?
						html`<a class='attribution attribution-link' target='new' href=${element.copyright.url} >  ${element.copyright.label}${separator}</a>` :
						html`<span class='attribution' > ${element.copyright.label}${separator}</span>`);
				});
			}
		});

		const getCollapseClass = () => {
			return (attributionCopyright.length > 1 || this._isOpen) ? 'is-collapse' : '';
		};

		const getTitle = () => {
			return this._isOpen ? 'map_attributionInfo_collapse_title_close' : 'map_attributionInfo_collapse_title_open';
		};

		return html`
			<style>${css}</style>
            <div class='attribution-container ${classMap(classes)}'>
				© ${translate('map_attributionInfo_label')}: 
				${attributionCopyright} 
				<div @click=${toggleOpen} class="collapse-button ${getCollapseClass()}" title="${translate(getTitle())}">
				<i class="icon chevron  "></i>
				</div>
			</div>
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
		return 'ba-attribution-info';
	}
}
