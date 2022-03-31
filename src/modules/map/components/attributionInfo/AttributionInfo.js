import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './attributionInfo.css';

/**
 * a class for displaying the attribution of the basemap
 * @class
 * @author bakir_en
 * @author taulinger
 */
export class AttributionInfo extends BaElement {

	constructor() {
		super();
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._georesourceService = GeoResourceService;
		this._isOpen = false;
	}

	_getAttributions(activeLayers, zoomLevel) {
		const rawAttributions = activeLayers
			.filter(l => l.visible)
			.map(l => this._georesourceService.byId(l.geoResourceId)?.getAttribution(zoomLevel))
			//remove null 'attr'
			.filter(attr => !!attr)
			.flat();

		// make attributions unique by 'label'
		const labels = rawAttributions.map(a => a?.copyright?.label); //attr.copyright.label should be guaranteed
		return rawAttributions.filter(({ copyright: { label } }, index) => !labels.includes(label, index + 1));
	}

	/**
	 * @override
	 */
	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { active, zoom } = state;

		const attributionTemplates =
			this._getAttributions(active, zoom).map((attribution, index, array) => {
				const separator = index === array.length - 1 ? '' : ',';
				return attribution.copyright.url
					? html`<a class='attribution attribution-link' target='_blank' href=${attribution.copyright.url}>${attribution.copyright.label}${separator}</a>`
					: html`<span class='attribution'>${attribution.copyright.label}${separator}</span>`;
			});

		const toggleOpen = () => {
			this._isOpen = !this._isOpen;
			this.render();
		};

		const classes = {
			isopen: this._isOpen
		};

		const getCollapseClass = () => {
			return (attributionTemplates.length > 1 || this._isOpen) ? 'is-collapse' : '';
		};

		const getTitle = () => {
			return this._isOpen ? 'map_attributionInfo_collapse_title_close' : 'map_attributionInfo_collapse_title_open';
		};

		return html`
			<style>${css}</style>
            <div class='attribution-container ${classMap(classes)}'>
				© ${translate('map_attributionInfo_label')}: 
				${attributionTemplates} 
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
