/**
 * @module modules/footer/components/baseLayerInfo/BaseLayerInfo
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { AggregateGeoResource } from '../../../../domain/geoResources';

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

		const getDescriptionForSingleGeoResource = (gr) => {
			const description = gr
				.getAttribution(zoomLevel)
				.map((a) => a.description)
				.filter((d) => !!d);

			return description.length ? description : [gr.label];
		};

		const getDescription = () => {
			const layer = activeLayers.find((l) => l.visible);

			const geoResource = layer ? this._georesourceService.byId(layer.geoResourceId) : null;
			if (geoResource) {
				const geoResources =
					geoResource instanceof AggregateGeoResource
						? geoResource.geoResourceIds
								.map((gr) => this._georesourceService.byId(gr))
								.filter((gr) => !!gr)
								.reverse()
						: [geoResource];

				const description = geoResources
					.map((gr) => getDescriptionForSingleGeoResource(gr))
					.flat()
					.join(', ');
				return description.length ? description : null;
			}

			return null;
		};

		const content = getDescription() ?? translate('map_baseLayerInfo_fallback');
		return html` <div>${content}</div> `;
	}

	static get tag() {
		return 'ba-base-layer-info';
	}
}
