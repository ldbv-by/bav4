/**
 * @module modules/layerManager/components/LayerSettingsPanel
 */
import { nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection/index';
import { AbstractVectorGeoResource } from '../../../domain/geoResources';
import { html } from '../../../../node_modules/lit-html/lit-html';
import { modifyLayer } from '../../../store/layers/layers.action';
import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '../../../domain/layer';

const Update_Layer = 'update_layer';

/**
 * A panel component to show and edit layer settings
 *
 * @class
 * @author thiloSchlemmer
 */
export class LayerSettingsPanel extends MvuElement {
	#translationService;
	#geoResourceService;
	constructor() {
		super({ layerProperties: null });

		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this.#translationService = TranslationService;
		this.#geoResourceService = GeoResourceService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Layer:
				return { ...model, layer: data };
			default:
				return model;
		}
	}

	createView(model) {
		const { layer } = model;
		const translate = (key) => this.#translationService.translate(key);

		const geoResource = this.#geoResourceService.byId(layer.geoResourceId);
		const settings = [];
		if (geoResource.isStylable()) {
			const onChangeColor = (color) => {
				modifyLayer(layer.id, { style: { baseColor: color } });
			};

			const colorContent = html`<div class="color-input">
				<input
					type="color"
					id="layer_color"
					name="${translate('layerManager_layer_settings_name_color')}"
					.value=${geoResource.style?.baseColor ?? '#FF0000'}
					@input=${(e) => onChangeColor(e.target.value)}
				/><label for="layer_color" class="settings-label">${translate('layerManager_layer_settings_label_color')}</label>
			</div>`;

			settings.push(colorContent);
		}

		if (geoResource.isUpdatableByInterval()) {
			const intervalContent = html`<div class="interval-input">
				<input
					type="number"
					id="layer_interval"
					name="${translate('layerManager_layer_settings_name_interval')}"
					.value=${geoResource.updateInterval ?? DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS}
					min=${DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS}
					@input=${(e) => geoResource.setUpdateInterval(e.target.value)}
				/><label for="layer_interval" class="settings-label">${translate('layerManager_layer_settings_label_interval')}</label>
			</div>`;

			settings.push(intervalContent);
		}
		return settings.length !== 0 ? html`<div>${settings}</div>` : nothing;
	}

	set layerId(layerId) {
		if (layerId) {
			const getLayerProperties = (layerId) => {
				const { StoreService } = $injector.inject('StoreService');
				return StoreService.getStore()
					.getState()
					.layers.active.find((l) => l.id === layerId);
			};

			this.signal(Update_Layer, getLayerProperties(layerId));
		}
	}

	static get tag() {
		return 'ba-layer-settings';
	}
}
