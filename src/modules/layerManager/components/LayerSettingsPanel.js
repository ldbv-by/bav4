/**
 * @module modules/layerManager/components/LayerSettingsPanel
 */
import { nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection/index';
import css from './layersettingspanel.css';
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
				const colorInput = this.shadowRoot.querySelector('#layer_color');
				if (colorInput && colorInput.value !== color) {
					colorInput.value = color;
				}
			};

			const colorContent = html`<div class="layer_setting">
				<div class="layer_setting_title">${translate('layerManager_layer_settings_label_color')}</div>
				<div class="layer_setting_content">
					<div class="color-input">
						<input
							type="color"
							id="layer_color"
							name="${translate('layerManager_layer_settings_name_color')}"
							.value=${geoResource.style?.baseColor ?? '#FF0000'}
							@input=${(e) => onChangeColor(e.target.value)}
						/>
					</div>
					<ba-color-palette @colorChanged=${(e) => onChangeColor(e.detail.color)}></ba-color-palette>
					</div>
				</div>
			</div>`;

			settings.push(colorContent);
		}

		if (geoResource.isUpdatableByInterval()) {
			const onChangeInterval = (interval) => {
				geoResource.setUpdateInterval(interval);
			};
			const intervalContent = html`<div class="layer_setting">
				<div class="layer_setting_title">${translate('layerManager_layer_settings_label_interval')}</div>
				<div class="layer_setting_content">
					<div class="interval-input">
						<input
							type="number"
							id="layer_interval"
							name="${translate('layerManager_layer_settings_name_interval')}"
							.value=${geoResource.updateInterval ?? DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS}
							min=${DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS}
							@input=${(e) => onChangeInterval(e.target.value)}
						/></div>
					</div>
				</div>
			</div>`;

			settings.push(intervalContent);
		}
		return settings.length !== 0
			? html`<style>
						${css}
					</style>
					<div>${settings}</div>`
			: nothing;
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

	get layerId() {
		const { layer } = this.getModel();

		return layer.id;
	}

	static get tag() {
		return 'ba-layer-settings';
	}
}
