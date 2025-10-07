/**
 * @module modules/layerManager/components/LayerItem
 */
import { html, nothing } from 'lit-html';
import css from './layerItem.css';
import { $injector } from '../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import {
	cloneAndAddLayer,
	LayerState,
	modifyLayer,
	openLayerFilterUI,
	openLayerSettingsUI,
	removeLayer
} from './../../../store/layers/layers.action';
import arrowUpSvg from './assets/arrow-up-short.svg';
import arrowDownSvg from './assets/arrow-down-short.svg';
import cloneSvg from './assets/clone.svg';
import zoomToExtentSvg from './assets/zoomToExtent.svg';
import removeSvg from './assets/trash.svg';
import exclamationTriangleSvg from './assets/exclamation-triangle-fill.svg';
import intervalSvg from './assets/clock-fill.svg';
import loadingSvg from './assets/loading.svg';
import infoSvg from '../../../assets/icons/info.svg';
import timeSvg from '../../../assets/icons/time.svg';
import oafSettingsSvg from './assets/oafSetting.svg';
import settingsSvgSmall from './assets/settings_small.svg';
import { AbstractMvuContentPanel } from '../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { openModal } from '../../../../src/store/modal/modal.action';
import { createUniqueId } from '../../../utils/numberUtils';
import { fitLayer } from '../../../store/position/position.action';
import { GeoResourceFuture, GeoResourceTypes, OafGeoResource } from '../../../domain/geoResources';
import { MenuTypes } from '../../commons/components/overflowMenu/OverflowMenu';
import { openSlider } from '../../../store/timeTravel/timeTravel.action';
import { SwipeAlignment } from '../../../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { isNumber } from '../../../utils/checks';

const Update_Layer_And_LayerItem = 'update_layer_and_layerItem';
const Update_Layer_Collapsed = 'update_layer_collapsed';
const Update_Layer_Swipe = 'update_layer_swipe';

/**
 * Collapse event
 * @event collapse
 * @type {object}
 * @property {module:modules/layerManager/components/LayerItem~CollapseDetail} detail The {@link CollapseDetail}
 */

/**
 * @typedef CollapseDetail
 * @property {module:store/layers/layer_action~Layer} layerId The id of the {@link Layer} related to this {@link LayerItem} event.
 * @property {boolean} collapsed Whether or not the {@link LayerItem} should be collapsed or not.
 */

/**
 * Child element of the LayerManager. Represents one layer and its state.
 *
 * @property {string} layerId The id of the {@link Layer} relating to this {@link LayerItem}.
 * @property {boolean} collapsed Whether or not the {@link LayerItem} should be collapsed.
 * @fires collapse Fires when the collapse value changes
 *
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 * @author costa_gi
 */
export class LayerItem extends AbstractMvuContentPanel {
	#translationService;
	#geoResourceService;
	constructor() {
		super({
			layerProperties: null,
			layerItemProperties: {
				collapsed: true,
				loading: false
			},
			isLayerSwipeActive: null
		});
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this.#translationService = TranslationService;
		this.#geoResourceService = GeoResourceService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Layer_And_LayerItem:
				return {
					...model,
					layerProperties: data.layerProperties,
					layerItemProperties: { ...model.layerItemProperties, ...data.layerItemProperties }
				};
			case Update_Layer_Collapsed:
				return { ...model, layerItemProperties: { ...model.layerItemProperties, collapsed: data } };
			case Update_Layer_Swipe:
				return { ...model, isLayerSwipeActive: data.active };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		const updateLayerProperties = (layers) => {
			const { layerProperties } = this.getModel();

			if (layerProperties?.id) {
				layers.filter((layer) => layer.id === layerProperties.id).forEach((layerProperties) => this._updateWithLayerProperties(layerProperties));
			}
		};
		this.observe(
			(store) => store.layers.active,
			(active) => updateLayerProperties(active.filter((l) => !l.constraints.hidden))
		);
		this.observe(
			(state) => state.layerSwipe,
			(layerSwipe) => this.signal(Update_Layer_Swipe, layerSwipe)
		);
	}

	/**
	 * @override
	 */
	onAfterRender(firsttime) {
		if (firsttime) {
			/* grab sliders on page */
			const sliders = this._root.querySelectorAll('input[type="range"]');

			/* take a slider element, return a percentage string for use in CSS */
			const rangeToPercent = (slider) => {
				const max = slider.getAttribute('max') || 100;
				const percent = (slider.value / max) * 100;
				return `${parseInt(percent)}%`;
			};

			/* on page load, set the fill amount */
			sliders.forEach((slider) => {
				slider.style.setProperty('--track-fill', rangeToPercent(slider));

				/* when a slider changes, update the fill prop */
				slider.addEventListener('input', (e) => {
					e.target.style.setProperty('--track-fill', rangeToPercent(e.target));
				});
			});
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { layerProperties, layerItemProperties, isLayerSwipeActive } = model;

		if (!layerProperties) {
			return nothing;
		}
		const geoResource = this.#geoResourceService.byId(layerProperties.geoResourceId);
		const currentLabel = layerItemProperties.label;
		// prefer baseColor of layer style over geoResource style
		const baseColor = geoResource.isStylable() ? (layerProperties.style?.baseColor ?? geoResource.style?.baseColor) : null;
		const getCollapseTitle = () => {
			return layerItemProperties.collapsed ? translate('layerManager_expand') : translate('layerManager_collapse');
		};

		const getBadges = (keywords) => {
			const toBadges = (keywords) =>
				keywords.map((keyword) => {
					const clickAction = keyword.description ? () => emitNotification(keyword.description, LevelTypes.INFO) : () => {};
					return html`<ba-badge
						.color=${'var(--text5)'}
						.background=${'var(--roles-' + keyword.name.toLowerCase() + ', var(--secondary-color))'}
						.label=${keyword.name}
						.title=${keyword.description ?? ''}
						@click=${clickAction}
					></ba-badge>`;
				});

			return keywords.length === 0 ? nothing : toBadges(keywords);
		};

		const onClickStateHint = (e, stateProperties) => {
			e.preventDefault();
			e.stopPropagation();
			emitNotification(stateProperties.title, stateProperties.level);
		};

		const getStateProperties = (state) => {
			switch (state) {
				case LayerState.ERROR:
					return {
						icon: exclamationTriangleSvg,
						color: 'var(--error-color)',
						title: translate(`layerManager_title_layerState_${state}`),
						level: LevelTypes.ERROR
					};
				case LayerState.INCOMPLETE_DATA:
					return {
						icon: exclamationTriangleSvg,
						color: 'var(--warning-color)',
						title: translate(`layerManager_title_layerState_${state}`),
						level: LevelTypes.WARN
					};
				case LayerState.LOADING:
					return {
						icon: loadingSvg,
						color: 'var(--secondary-color)',
						title: translate(`layerManager_title_layerState_${state}`),
						level: LevelTypes.INFO
					};
				case LayerState.OK:
					return null;
			}
		};

		const getFeatureCountBadge = (featureCount, layerState) => {
			return isNumber(featureCount) && layerState !== LayerState.LOADING
				? html`<ba-badge
						class="feature-count-badge"
						.background=${'var(--secondary-color)'}
						.label=${featureCount}
						.title=${translate('layerManager_feature_count')}
						.color=${'var(--text5)'}
						.size=${'0.8'}
					></ba-badge>`
				: nothing;
		};

		const getStateHint = (layerState) => {
			const stateProperties = getStateProperties(layerState);
			return stateProperties
				? html`<ba-icon
						.icon="${stateProperties.icon}"
						.title="${stateProperties.title}"
						.size=${'1.2'}
						.color="${stateProperties.color}"
						.color_hover="${stateProperties.color}"
						@click=${(e) => onClickStateHint(e, stateProperties)}
						class="layer-state-icon ${layerState}"
					></ba-icon>`
				: nothing;
		};

		const changeOpacity = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(layerProperties.id, { opacity: parseInt(event.target.value) / 100 });
		};
		const toggleVisibility = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(layerProperties.id, { visible: event.detail.checked });
		};
		const toggleCollapse = () => {
			const collapsed = !layerItemProperties.collapsed;
			this.signal(Update_Layer_Collapsed, collapsed);
			this.dispatchEvent(
				new CustomEvent('collapse', {
					detail: {
						layerId: layerProperties.id,
						collapsed: collapsed
					}
				})
			);
		};
		const increaseIndex = () => {
			//state store change -> implicit call of #render()
			modifyLayer(layerProperties.id, { zIndex: layerProperties.zIndex + 1 });
		};
		const decreaseIndex = () => {
			//state store change -> implicit call of #render()
			if (layerProperties.zIndex - 1 >= 0) {
				modifyLayer(layerProperties.id, { zIndex: layerProperties.zIndex - 1 });
			}
		};

		const cloneLayer = () => {
			//state store change -> implicit call of #render()
			cloneAndAddLayer(layerProperties.id, `${layerProperties.geoResourceId}_${createUniqueId()}`, { zIndex: layerProperties.zIndex + 1 });
		};

		const zoomToExtent = () => {
			fitLayer(layerProperties.id);
		};

		const remove = () => {
			//state store change -> implicit call of #render()
			removeLayer(layerProperties.id);
		};

		const openSettings = () => {
			openLayerSettingsUI(layerProperties.id);
		};

		const getSlider = () => {
			const onPreventDragging = (e) => {
				e.preventDefault();
				e.stopPropagation();
			};

			return html`<div class="slider-container">
				<input
					type="range"
					min="0"
					title=${translate('layerManager_opacity')}
					max="100"
					value=${layerProperties.opacity * 100}
					class="opacity-slider"
					draggable="true"
					@input=${changeOpacity}
					@dragstart=${onPreventDragging}
					id="opacityRange"
				/>
				<ba-badge
					.background=${'var(--secondary-color)'}
					.label=${Math.round(layerProperties.opacity * 100)}
					.color=${'var(--text5)'}
					.title=${translate('layerManager_opacity_badge')}
				></ba-badge>
			</div>`;
		};

		const getTimestampIcon = () => {
			const getControl = () => {
				return html`
					<div class="time-travel-icon">
						<ba-icon
							.icon="${timeSvg}"
							.title=${translate('layerManager_time_travel_slider')}
							@click=${() => openSlider()}
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${2.5}
						></ba-icon>
					</div>
				`;
			};
			return geoResource.hasTimestamps() ? getControl() : nothing;
		};

		const getIntervalBadge = () => {
			if (geoResource?.isUpdatableByInterval()) {
				const interval = layerProperties.constraints.updateInterval ?? geoResource.updateInterval;
				return interval
					? html`<ba-icon
							.icon="${intervalSvg}"
							.title="${translate('layerManager_interval_badge')}"
							.size=${'1.2'}
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--secondary-color)'}
							@click=${() => openLayerSettingsUI(layerProperties.id)}
							class="interval-icon"
						></ba-icon>`
					: null;
			}
			return null;
		};

		const getTimestampBadge = () => {
			const getControl = () => {
				const onTimestampChange = (event) => {
					const timestamp = event.detail.selected;
					modifyLayer(layerProperties.id, { timestamp });
				};
				const selected = layerProperties.timestamp ?? geoResource.timestamps[0];
				return html` <ba-value-select
					.title=${translate('layerManager_time_travel_hint')}
					.values=${geoResource.timestamps}
					.selected=${selected}
					@select=${onTimestampChange}
				></ba-value-select>`;
			};
			return geoResource.hasTimestamps() ? getControl() : nothing;
		};

		const getOafContent = () => {
			return geoResource instanceof OafGeoResource
				? html`<div class="oaf-settings-icon">
						<ba-icon
							.icon="${oafSettingsSvg}"
							.title=${translate('layerManager_oaf_settings')}
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${2.5}
							@click=${() => {
								openLayerFilterUI(layerProperties.id);
							}}
						></ba-icon>
					</div>`
				: nothing;
		};

		const getVisibilityTitle = () => {
			return layerItemProperties.label + ' - ' + translate('layerManager_change_visibility');
		};

		const iconCollapseClass = {
			iconexpand: !layerItemProperties.collapsed
		};

		const bodyCollapseClass = {
			iscollapse: layerItemProperties.collapsed
		};

		const openGeoResourceInfoPanel = () => {
			const {
				layerProperties: { geoResourceId },
				layerItemProperties: { label }
			} = this.getModel();
			openModal(label, html`<ba-georesourceinfo-panel .geoResourceId=${geoResourceId}></ba-georesourceinfo-panel>`);
		};

		const getMenuItems = () => {
			return [
				{
					id: 'copy',
					label: translate('layerManager_to_copy'),
					icon: cloneSvg,
					action: cloneLayer,
					disabled: !layerProperties.constraints.cloneable
				},
				{
					id: 'zoomToExtent',
					label: translate('layerManager_zoom_to_extent'),
					icon: zoomToExtentSvg,
					action: zoomToExtent,
					disabled: !LayerItem._getZoomToExtentCapableGeoResources().includes(geoResource.getType())
				},
				{
					id: 'settings',
					label: translate('layerManager_open_settings'),
					icon: settingsSvgSmall,
					action: openSettings,
					disabled: !geoResource.isStylable() && !geoResource.isUpdatableByInterval()
				}
			];
		};

		const leftSide = () => {
			modifyLayer(layerProperties.id, { swipeAlignment: SwipeAlignment.LEFT });
		};
		const bothSide = () => {
			modifyLayer(layerProperties.id, { swipeAlignment: SwipeAlignment.NOT_SET });
		};
		const rightSide = () => {
			modifyLayer(layerProperties.id, { swipeAlignment: SwipeAlignment.RIGHT });
		};

		const getLayerSwipe = () => {
			const direction = layerProperties.constraints.swipeAlignment;
			const directionClass = {
				left: direction === SwipeAlignment.LEFT,
				both: direction === SwipeAlignment.NOT_SET,
				right: direction === SwipeAlignment.RIGHT
			};
			return isLayerSwipeActive
				? html`
						<div class="compare">
							<ba-button
								id="left"
								class=${direction === SwipeAlignment.LEFT ? 'active' : ''}
								.label=${translate('layerManager_compare_left')}
								.title=${translate('layerManager_compare_left_title')}
								@click=${leftSide}
							></ba-button>
							<ba-button
								id="both"
								class=${direction === SwipeAlignment.NOT_SET ? 'active' : ''}
								.label=${translate('layerManager_compare_both')}
								.title=${translate('layerManager_compare_both_title')}
								@click=${bothSide}
							></ba-button>
							<ba-button
								id="right"
								class=${direction === SwipeAlignment.RIGHT ? 'active' : ''}
								.label=${translate('layerManager_compare_right')}
								.title=${translate('layerManager_compare_right_title')}
								@click=${rightSide}
							></ba-button>
							<div class="bar ${classMap(directionClass)}"></div>
						</div>
					`
				: nothing;
		};

		return html` <style>
				${css}
			</style>
			<div class="ba-section divider layer-item" style=${baseColor ? `--base-color: ${baseColor}; ` : ''}>
				<div class="ba-list-item">
					<ba-checkbox
						.type=${'eye'}
						.title="${getVisibilityTitle()}"
						class="ba-list-item__text"
						tabindex="0"
						.checked=${layerProperties.visible}
						@toggle=${toggleVisibility}
						>${layerItemProperties.loading ? html`<ba-spinner .label=${currentLabel}></ba-spinner>` : html`${currentLabel}`}
					</ba-checkbox>

					<div class="ba-list-item-badges">
						${getStateHint(layerProperties.state)} ${getBadges(layerItemProperties.keywords)}
						${getIntervalBadge()}${getFeatureCountBadge(layerProperties.props.featureCount, layerProperties.state)}${getTimestampBadge()}
					</div>
					${getOafContent()} ${getTimestampIcon()}
					<div class="ba-list-item__after clear">
						<ba-icon
							id="remove"
							.icon="${removeSvg}"
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${2.5}
							.title=${translate('layerManager_remove')}
							@click=${remove}
						></ba-icon>
					</div>
					<div class="ba-list-item__after toggle">
						<button id="button-detail" data-test-id title="${getCollapseTitle()}" @click="${toggleCollapse}">
							<i class="icon chevron icon-rotate-90 ${classMap(iconCollapseClass)}"></i>
						</button>
					</div>
				</div>
				<div class="collapse-content  ${classMap(bodyCollapseClass)}">
					<div class="ba-list-item">
						${getSlider()}
						<div>
							<ba-icon
								id="increase"
								.icon="${arrowUpSvg}"
								.color=${'var(--primary-color)'}
								.color_hover=${'var(--text3)'}
								.size=${2.5}
								.title=${translate('layerManager_move_up')}
								@click=${increaseIndex}
							></ba-icon>
						</div>
						<div>
							<ba-icon
								id="decrease"
								.icon="${arrowDownSvg}"
								.color=${'var(--primary-color)'}
								.color_hover=${'var(--text3)'}
								.size=${2.5}
								.title=${translate('layerManager_move_down')}
								@click=${decreaseIndex}
							></ba-icon>
						</div>
						<div>
							<ba-icon
								id="info"
								.icon="${infoSvg}"
								.color=${'var(--primary-color)'}
								.color_hover=${'var(--text3)'}
								.size=${2.5}
								.title=${translate('layerManager_info')}
								.disabled=${!layerProperties.constraints?.metaData}
								@click=${openGeoResourceInfoPanel}
							></ba-icon>
						</div>
						<ba-overflow-menu .type=${MenuTypes.MEATBALL} .items=${getMenuItems()}></ba-overflow-menu>
					</div>
				</div>
				${getLayerSwipe()}
			</div>`;
	}

	_updateWithLayerProperties(layerProperties) {
		if (!layerProperties) {
			return;
		}
		const translate = (key) => this.#translationService.translate(key);
		const geoResource = this.#geoResourceService.byId(layerProperties.geoResourceId);
		const keywords = [...this.#geoResourceService.getKeywords(layerProperties.geoResourceId)];

		if (geoResource instanceof GeoResourceFuture) {
			geoResource.onResolve((resolvedGeoR) => {
				this.signal(Update_Layer_And_LayerItem, {
					layerProperties: layerProperties,
					layerItemProperties: {
						label: resolvedGeoR.label,
						loading: false,
						keywords: keywords
					}
				});
			});
		}

		this.signal(Update_Layer_And_LayerItem, {
			layerProperties: layerProperties,
			layerItemProperties: {
				label: geoResource instanceof GeoResourceFuture ? translate('layerManager_loading_hint') : geoResource.label,
				loading: geoResource instanceof GeoResourceFuture,
				keywords: keywords
			}
		});
	}

	set layerId(layerId) {
		if (layerId) {
			const getLayerProperties = (layerId) => {
				const { StoreService } = $injector.inject('StoreService');
				return StoreService.getStore()
					.getState()
					.layers.active.find((l) => l.id === layerId);
			};

			this._updateWithLayerProperties(getLayerProperties(layerId));
		}
	}

	set collapsed(collapsed) {
		this.signal(Update_Layer_Collapsed, collapsed);
	}

	static get tag() {
		return 'ba-layer-item';
	}

	static _getZoomToExtentCapableGeoResources() {
		return [GeoResourceTypes.VECTOR, GeoResourceTypes.RT_VECTOR, GeoResourceTypes.OAF];
	}
}
