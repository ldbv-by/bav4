/**
 * @module modules/layerManager/components/LayerSettingsPanel
 */
import { nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection/index';
import css from './layerSettingsPanel.css';
import { html } from '../../../../node_modules/lit-html/lit-html';
import { modifyLayer } from '../../../store/layers/layers.action';
import resetSvg from './assets/arrow-counterclockwise.svg';
import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '../../../domain/layer';
import { AbstractVectorGeoResource, VectorGeoResource } from '../../../domain/geoResources';

const Update_Layer_Settings = 'update_layer_Settings_State';

/**
 * State of a layer setting
 * @readonly
 * @enum {String}
 */
const SettingState = Object.freeze({
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
		const { layerProperties, geoResource } = model;
		const translate = (key) => this.#translationService.translate(key);

		if (!layerProperties) {
			return nothing;
		}

		const settings = [
			this._getColorSetting(model),
			this._getIntervalSetting(model),
			this._getToggleLabels(model),
			this._getResetToDefault(model)
		].filter((s) => s !== null);

		return html`<style>
				${css}
			</style>
			<div class="layer_settings_container">
				<div class="header">
					<h3>
						<span class="icon"> </span>
						<span id="layer_settings_header" class="text"
							>${geoResource.label ? geoResource.label : translate('layerManager_layer_settings_header')}</span
						>
					</h3>
				</div>
				${settings.length > 0
					? settings
					: html`<div class="layer_settings_no_settings">${translate('layerManager_layer_settings_no_settings_available')}</div>`}
			</div>`;
	}

	_getColorSetting(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { layerProperties, geoResource } = model;

		const colorState = this._getColorState(layerProperties, geoResource);
		const getDefaultColor = () => geoResource.style?.baseColor ?? '#';

		const getBaseColor = () => {
			const baseColor = layerProperties.style?.baseColor ? layerProperties.style.baseColor : getDefaultColor();
			return baseColor;
		};

		const onChangeColor = (color) => {
			modifyLayer(layerProperties.id, { style: { baseColor: color } });
			this.layerId = layerProperties.id;
		};
		const baseColor = getBaseColor();
		return colorState === SettingState.DISABLED
			? null
			: html`<div class="layer_setting">
					<div class="layer_setting_title">
						<div class="header-icon palette-icon"></div>
						<div>${translate('layerManager_layer_settings_label_color')}</div>
					</div>
					<div class="layer_setting_content ${colorState === SettingState.INACTIVE ? 'inactive' : ''}">
						<div class="color-input" title=${translate('layerManager_layer_settings_description_color_picker')}>
							<input
								type="color"
								id="layer_color"
								name=${translate('layerManager_layer_settings_label_color')}
								.value=${baseColor}
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
		const getDefaultInterval = () => geoResource.updateInterval ?? 0;

		const getInterval = () => {
			const interval = layerProperties.constraints.updateInterval ? parseInt(layerProperties.constraints.updateInterval) : getDefaultInterval();

			return secondsToMinute(interval < DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS ? 0 : interval);
		};

		const onChangeInterval = (interval) => {
			modifyLayer(layerProperties.id, { updateInterval: minuteToSeconds(parseInt(interval)) });
			this.layerId = layerProperties.id;
		};

		const getBadge = () =>
			intervalState === SettingState.ACTIVE
				? html`<ba-badge
						.background=${'var(--primary-color)'}
						.label=${getInterval()}
						.color=${'var(--text3)'}
						.size=${'1.2'}
						.title=${translate('layerManager_layer_settings_unit_interval')}
					>
					</ba-badge>`
				: nothing;

		return intervalState === SettingState.DISABLED
			? null
			: html` <div class="layer_setting">
					<div class="layer_setting_title">
						<div class="header-icon clock-icon"></div>
						<div>${translate('layerManager_layer_settings_title_interval')}</div>
						</div>
						<div class="layer_setting_content ${intervalState === SettingState.ACTIVE ? '' : 'inactive'}">
							<div class="interval-container">
								<label for="layer_interval_slider" class="control-label">${translate('layerManager_layer_settings_unit_interval')}</label>
								<input
									type="range"
									id="layer_interval_slider"
									step="1"
									min="0"
									max=${secondsToMinute(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 30)}
									.value=${getInterval()}
									@input=${(e) => onChangeInterval(e.target.value)}
								/>
								${getBadge()}
							</div>
						</div>
						<div class="layer_setting_description">${translate('layerManager_layer_settings_description_interval')}</div>
					</div>
				</div>`;
	}

	_getToggleLabels(model) {
		const { layerProperties, geoResource } = model;
		const translate = (key) => this.#translationService.translate(key);

		const onToggleLabels = (e) => {
			modifyLayer(layerProperties.id, { displayFeatureLabels: e.detail.checked });
			this.layerId = layerProperties.id;
		};

		const labelState = this._getLabelState(layerProperties, geoResource);

		const showLabels = layerProperties.constraints.displayFeatureLabels ?? geoResource.displayFeatureLabels;
		return labelState === SettingState.DISABLED
			? null
			: html` <div class="layer_setting">
					<div class="layer_setting_title">
						<div class="header-icon label-icon"></div>
						<div>${translate('layerManager_layer_settings_label_show_labels')}</div>
					</div>
					<div class="layer_setting_content">
						<ba-switch id="toggle_feature_labels" .checked=${showLabels} @toggle=${onToggleLabels}>
							<div class="toggle__label" slot="before">
								<div class="toggle__description">${translate('layerManager_layer_settings_description_show_labels')}</div>
								<div class="toggle__description_note">${translate('layerManager_layer_settings_description_show_labels_note')}</div>
							</div>
						</ba-switch>
					</div>
				</div>`;
	}

	_getResetToDefault(model) {
		const { layerProperties, geoResource } = model;
		const translate = (key) => this.#translationService.translate(key);

		const defaultLayerProperties = { updateInterval: null, style: null, displayFeatureLabels: true };
		const colorState = this._getColorState(layerProperties, geoResource);
		const intervalState = this._getIntervalState(layerProperties, geoResource);
		const labelState = this._getLabelState(layerProperties, geoResource);

		const onResetToDefault = () => {
			modifyLayer(layerProperties.id, defaultLayerProperties);
			this.layerId = layerProperties.id;
		};

		const isDefault =
			!layerProperties.constraints?.updateInterval && !layerProperties.style?.baseColor && layerProperties.constraints?.displayFeatureLabels;

		return intervalState === SettingState.DISABLED && colorState === SettingState.DISABLED && labelState === SettingState.DISABLED
			? null
			: html` <div class="layer_setting layer_button_content ">
					<ba-button
						class="reset_settings ${isDefault ? 'disabled' : ''}"
						.icon=${resetSvg}
						.title=${translate('layerManager_layer_settings_description_reset')}
						.label=${translate('layerManager_layer_settings_reset')}
						.disabled=${isDefault}
						.type=${'primary'}
						@click=${onResetToDefault}
					></ba-button>
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
			const color = layerProperties.style?.baseColor ?? geoResource.style?.baseColor;
			return color ? SettingState.ACTIVE : SettingState.INACTIVE;
		}
		return SettingState.DISABLED;
	}

	_getIntervalState(layerProperties, geoResource) {
		if (geoResource.isUpdatableByInterval()) {
			const interval = layerProperties.constraints.updateInterval ?? geoResource.updateInterval;
			return interval ? SettingState.ACTIVE : SettingState.INACTIVE;
		}
		return SettingState.DISABLED;
	}

	_getLabelState(layerProperties, geoResource) {
		if (geoResource instanceof AbstractVectorGeoResource) {
			const displayFeatureLabels = layerProperties.constraints.displayFeatureLabels ?? geoResource.displayFeatureLabels;
			return displayFeatureLabels ? SettingState.ACTIVE : SettingState.INACTIVE;
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
