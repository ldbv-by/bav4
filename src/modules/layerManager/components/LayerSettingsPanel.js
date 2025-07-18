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

const Update_Layer_Settings = 'update_layer_Settings_State';

/**
 * State of a layer setting
 * @readonly
 * @enum {String}
 */
export const SettingState = Object.freeze({
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DISABLED: 'disabled'
});

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
		super({ layerProperties: null, geoResource: null });

		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this.#translationService = TranslationService;
		this.#geoResourceService = GeoResourceService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Layer_Settings:
				return {
					...model,
					layerProperties: data.layerProperties,
					geoResource: data.geoResource
				};
		}
	}

	createView(model) {
		const { layerProperties } = model;

		if (!layerProperties) {
			return nothing;
		}

		const settings = [this._getColorSetting(model), this._getIntervalSetting(model)];

		return html`<style>
				${css}
			</style>
			<div class="layer_settings_container">${settings}</div>`;
	}

	_getColorSetting(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { layerProperties, geoResource } = model;

		const colorState = this._getColorState(layerProperties, geoResource);
		const getDefaultColor = () => geoResource.style?.baseColor ?? '#FF0000';

		const onChangeColor = (color) => {
			modifyLayer(layerProperties.id, { style: { baseColor: color } });
			this.layerId = layerProperties.id;
		};

		const onToggle = (e) => {
			modifyLayer(layerProperties.id, { style: e.detail.checked ? { baseColor: getDefaultColor() } : null });
			this.layerId = layerProperties.id;
		};

		return colorState === SettingState.DISABLED
			? null
			: html`<div class="layer_setting">
					<div class="layer_setting_title">
						<ba-switch
							.title=${translate('layerManager_layer_settings_label_color')}
							.checked=${colorState === SettingState.ACTIVE}
							@toggle=${onToggle}
							><span slot="before">${translate('layerManager_layer_settings_label_color')}</span></ba-switch
						>
					</div>
					<div class="layer_setting_content ${colorState === SettingState.ACTIVE ? '' : 'inactive'}">
						<div class="color-input">
							<input
								type="color"
								id="layer_color"
								name="${translate('layerManager_layer_settings_name_color')}"
								.value=${colorState !== SettingState.ACTIVE ? getDefaultColor() : layerProperties.style.baseColor}
								.disabled=${colorState !== SettingState.ACTIVE}
								@input=${(e) => onChangeColor(e.target.value)}
							/>
						</div>
						<ba-color-palette @colorChanged=${(e) => onChangeColor(e.detail.color)}></ba-color-palette>
					</div>
					<div class="layer_setting_description">${translate('layerManager_layer_settings_description_color')}</div>
				</div>`;
	}

	_getIntervalSetting(model) {
		const { layerProperties, geoResource } = model;
		const translate = (key) => this.#translationService.translate(key);
		const secondsPerMinute = 60;
		const secondsToMinute = (seconds) => {
			return seconds / secondsPerMinute;
		};

		const minuteToSeconds = (minutes) => {
			return minutes * secondsPerMinute;
		};
		const intervalState = this._getIntervalState(layerProperties, geoResource);
		const getDefaultInterval = () => geoResource.updateInterval ?? DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 5;

		const getInterval = () => secondsToMinute(parseInt(layerProperties.constraints.updateInterval));

		const onChangeInterval = (interval) => {
			modifyLayer(layerProperties.id, { updateInterval: minuteToSeconds(parseInt(interval)) });
			this.layerId = layerProperties.id;
		};

		const onToggle = (e) => {
			modifyLayer(layerProperties.id, {
				updateInterval: e.detail.checked ? getDefaultInterval() : null
			});
			this.layerId = layerProperties.id;
		};

		const getBadge = () =>
			intervalState === SettingState.ACTIVE
				? html`<ba-badge
						.background=${'var(--primary-color)'}
						.label=${secondsToMinute(parseInt(layerProperties.constraints.updateInterval))}
						.color=${'var(--text3)'}
						.title=${translate('layerManager_layer_settings_unit_interval')}
					>
					</ba-badge>`
				: nothing;

		return intervalState === SettingState.DISABLED
			? null
			: html`<div class="layer_setting">
					<div class="layer_setting_title">
						<ba-switch
							.title=${translate('layerManager_layer_settings_title_interval')}
							.checked=${intervalState === SettingState.ACTIVE}
							@toggle=${onToggle}
							><span slot="before">${translate('layerManager_layer_settings_title_interval')}</span></ba-switch
						>
					</div>
					<div class="layer_setting_content ${intervalState === SettingState.ACTIVE ? '' : 'inactive'}">
						<div class="interval-container">
							<label for="layer_interval_slider" class="control-label">${translate('layerManager_layer_settings_unit_interval')}</label>
							<input
								type="range"
								id="layer_interval_slider"
								step="1"
								min=${secondsToMinute(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS)}
								max=${secondsToMinute(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 30)}
								.value=${intervalState === SettingState.ACTIVE ? `${getInterval()}` : null}
								@input=${(e) => onChangeInterval(e.target.value)}
								.disabled=${intervalState !== SettingState.ACTIVE}
							/>
							${getBadge()}
						</div>
					</div>
					<div class="layer_setting_description">${translate('layerManager_layer_settings_description_interval')}</div>
				</div>`;
	}

	set layerId(layerId) {
		const getLayerProperties = (layerId) => {
			const { StoreService } = $injector.inject('StoreService');
			return StoreService.getStore()
				.getState()
				.layers.active.find((l) => l.id === layerId);
		};
		const getGeoResource = (layerProperties) => {
			return this.#geoResourceService.byId(layerProperties.geoResourceId);
		};

		if (layerId) {
			const layerProperties = getLayerProperties(layerId);
			const geoResource = getGeoResource(layerProperties);
			if (geoResource) {
				this.signal(Update_Layer_Settings, {
					layerProperties: layerProperties,
					geoResource: geoResource
				});
			}
		}
	}

	_getColorState(layerProperties, geoResource) {
		if (geoResource.isStylable()) {
			return layerProperties.style || geoResource.style ? SettingState.ACTIVE : SettingState.INACTIVE;
		}
		return SettingState.DISABLED;
	}

	_getIntervalState(layerProperties, geoResource) {
		if (geoResource.isUpdatableByInterval()) {
			return layerProperties.constraints.updateInterval || geoResource.hasUpdateInterval() ? SettingState.ACTIVE : SettingState.INACTIVE;
		}
		return SettingState.DISABLED;
	}

	get layerId() {
		const { layerProperties } = this.getModel();
		return layerProperties ? layerProperties.id : null;
	}

	static get tag() {
		return 'ba-layer-settings';
	}
}
