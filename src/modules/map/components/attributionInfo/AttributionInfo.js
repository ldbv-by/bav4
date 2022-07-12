import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './attributionInfo.css';
import { MvuElement } from '../../../MvuElement';

const Update_Open_Property = 'update_open_property';
const Update_ActiveLayers_Property = 'update_activeLayers_property';
const Update_ZoomLevel_Property = 'update_zoomLevel_property';

/**
 * Displays the attribution of the basemap
 * @class
 * @author bakir_en
 * @author taulinger
 */
export class AttributionInfo extends MvuElement {

	constructor() {
		super({
			open: false,
			activeLayers: null,
			zoomLevel: null
		});
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._georesourceService = GeoResourceService;
	}

	onInitialize() {
		this.observe(state => state.layers.active, activeLayers => this.signal(Update_ActiveLayers_Property, activeLayers));
		this.observe(state => state.position.zoom, zoomLevel => this.signal(Update_ZoomLevel_Property, zoomLevel));
	}

	update(type, data, model) {

		switch (type) {
			case Update_Open_Property:
				return { ...model, open: data };
			case Update_ActiveLayers_Property:
				return { ...model, activeLayers: data };
			case Update_ZoomLevel_Property:
				return { ...model, zoomLevel: data };
		}
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
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { activeLayers, zoomLevel, open } = model;

		const attributionTemplates =
			this._getAttributions(activeLayers, zoomLevel).map((attribution, index, array) => {
				const separator = index === array.length - 1 ? '' : ',';
				return attribution.copyright.url
					? html`<a class='attribution attribution-link' target='_blank' href=${attribution.copyright.url}>${attribution.copyright.label}${separator}</a>`
					: html`<span class='attribution'>${attribution.copyright.label}${separator}</span>`;
			});

		const toggleVisibilitiy = () => this.signal(Update_Open_Property, !open);

		const classes = {
			isopen: open
		};

		const getCollapseClass = () => {
			return (attributionTemplates.length > 1 || open) ? 'is-collapse' : '';
		};

		const getTitle = () => {
			return open ? 'map_attributionInfo_collapse_title_close' : 'map_attributionInfo_collapse_title_open';
		};

		return html`
			<style>${css}</style>
            <div class='attribution-container ${classMap(classes)}'>
				© ${translate('map_attributionInfo_label')}: 
				${attributionTemplates} 
				<div @click=${toggleVisibilitiy} class="collapse-button ${getCollapseClass()}" title="${translate(getTitle())}">
				<i class="icon chevron  "></i>
				</div>
			</div>
			`;
	}

	static get tag() {
		return 'ba-attribution-info';
	}
}
