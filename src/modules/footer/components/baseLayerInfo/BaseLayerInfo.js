/**
 * @module modules/footer/components/baseLayerInfo/BaseLayerInfo
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

const Update_Layers = 'update_layers';
const Update_ZoomLevel = 'update_zoomLevel';
/**
 * Displays information about the base layer
 * @class
 * @author bakir_en
 * @author taulinger
 */
export class BaseLayerInfo extends MvuElement {
	constructor() {
		super({
			activeLayers: null,
			zoomLevel: null
		});
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._georesourceService = GeoResourceService;

		this.observe(
			(store) => store.layers.active,
			(active) => this.signal(Update_Layers, [...active])
		);
		this.observe(
			(store) => store.position.zoom,
			(zoom) => this.signal(Update_ZoomLevel, zoom)
		);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Layers:
				return { ...model, activeLayers: [...data] };
			case Update_ZoomLevel:
				return { ...model, zoomLevel: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);

		const { activeLayers, zoomLevel } = model;

		const getDescription = () => {
			const geoResource = activeLayers[0] ? this._georesourceService.byId(activeLayers[0].geoResourceId) : null;
			if (geoResource) {
				const description = geoResource
					.getAttribution(zoomLevel)
					.map((a) => a.description)
					.filter((d) => !!d)
					.join(', ');
				return description ? description : geoResource.label;
			}

			return null;
		};

		const content = getDescription() ?? translate('map_baseLayerInfo_fallback');

		return activeLayers.length > 0 ? html` <div>${translate('map_baseLayerInfo_label')}: ${content}</div> ` : nothing;
	}

	static get tag() {
		return 'ba-base-layer-info';
	}
}
