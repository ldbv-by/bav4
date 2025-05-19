/**
 * @module modules/layerManager/components/LayerItem
 */
import { html, nothing } from 'lit-html';
import css from './layerItem.css';
import { $injector } from '../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import { cloneAndAddLayer, modifyLayer, removeLayer } from './../../../store/layers/layers.action';
import arrowUpSvg from './assets/arrow-up-short.svg';
import arrowDownSvg from './assets/arrow-down-short.svg';
import cloneSvg from './assets/clone.svg';
import zoomToExtentSvg from './assets/zoomToExtent.svg';
import removeSvg from './assets/trash.svg';
import infoSvg from '../../../assets/icons/info.svg';
import timeSvg from '../../../assets/icons/time.svg';
import { AbstractMvuContentPanel } from '../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { openModal } from '../../../../src/store/modal/modal.action';
import { createUniqueId } from '../../../utils/numberUtils';
import { fitLayer } from '../../../store/position/position.action';
import { GeoResourceFuture, GeoResourceTypes } from '../../../domain/geoResources';
import { MenuTypes } from '../../commons/components/overflowMenu/OverflowMenu';
import { openSlider } from '../../../store/timeTravel/timeTravel.action';
import { SwipeAlignment } from '../../../store/layers/layers.action';

const Update_Layer_And_LayerProperties = 'update_layer_and_layerProperties';
const Update_Layer_Collapsed = 'update_layer_collapsed';
const Update_Layer_Swipe = 'update_layer_swipe';

const Default_Layer_Item_Properties = {
	label: '',
	collapsed: true,
	loading: false,
	keywords: []
};

/**
 * Collapse event
 *
 * @event collapse
 * @type {object}
 * @property {module:modules/layerManager/components/LayerItem~CollapseDetail} detail The {@link CollapseDetail}
 */

/**
 * @typedef CollapseDetail
 * @property {module:store/layers/layer_action~Layer} layer The {@link Layer} related to this {@link LayerItem} event.
 * @property {boolean} collapsed Whether or not the {@link LayerItem} should be collapsed or not.
 */

/**
 * Child element of the {@link LayerManager}. Represents one layer and its state.
 *
 * @property {module:store/layers/layer_action~Layer} layer The {@link Layer}.
 * @property {boolean} collapsed Whether or not the LayerItem is collapsed
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
			layer: null,
			layerItemProperties: { ...Default_Layer_Item_Properties },
			isLayerSwipeActive: false
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
			case Update_Layer_And_LayerProperties:
				return { ...model, layer: { ...data.layer }, layerItemProperties: { ...Default_Layer_Item_Properties, ...data.changedLayerItemProperties } };
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
		const { layer, layerItemProperties, isLayerSwipeActive } = model;

		if (!layer) {
			return nothing;
		}
		const geoResource = this.#geoResourceService.byId(layer.geoResourceId);
		const currentLabel = layerItemProperties.label;

		const getCollapseTitle = () => {
			return layerItemProperties.collapsed ? translate('layerManager_expand') : translate('layerManager_collapse');
		};

		const getBadges = (keywords) => {
			const toBadges = (keywords) =>
				keywords.map((keyword) => html`<ba-badge .color=${'var(--text3)'} .background=${'var(--roles-color)'} .label=${keyword}></ba-badge>`);

			return keywords.length === 0 ? nothing : toBadges(keywords);
		};

		const changeOpacity = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(layer.id, { opacity: parseInt(event.target.value) / 100 });
		};
		const toggleVisibility = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(layer.id, { visible: event.detail.checked });
		};
		const toggleCollapse = () => {
			const collapsed = !layerItemProperties.collapsed;
			this.signal(Update_Layer_Collapsed, collapsed);
			this.dispatchEvent(
				new CustomEvent('collapse', {
					detail: {
						layer: { ...layer },
						collapsed: collapsed
					}
				})
			);
		};
		const increaseIndex = () => {
			//state store change -> implicit call of #render()
			modifyLayer(layer.id, { zIndex: layer.zIndex + 1 });
		};
		const decreaseIndex = () => {
			//state store change -> implicit call of #render()
			if (layer.zIndex - 1 >= 0) {
				modifyLayer(layer.id, { zIndex: layer.zIndex - 1 });
			}
		};

		const cloneLayer = () => {
			//state store change -> implicit call of #render()
			cloneAndAddLayer(layer.id, `${layer.geoResourceId}_${createUniqueId()}`, { zIndex: layer.zIndex + 1 });
		};

		const zoomToExtent = () => {
			fitLayer(layer.id);
		};

		const remove = () => {
			//state store change -> implicit call of #render()
			removeLayer(layer.id);
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
					value=${layer.opacity * 100}
					class="opacity-slider"
					draggable="true"
					@input=${changeOpacity}
					@dragstart=${onPreventDragging}
					id="opacityRange"
				/>
				<ba-badge
					.background=${'var(--secondary-color)'}
					.label=${Math.round(layer.opacity * 100)}
					.color=${'var(--text3)'}
					.title=${translate('layerManager_opacity_badge')}
				></ba-badge>
			</div>`;
		};

		const getTimestampContent = () => {
			const getTimestampControl = () => {
				const onTimestampChange = (event) => {
					const timestamp = event.detail.selected;
					modifyLayer(layer.id, { timestamp });
				};
				const selected = layer.timestamp ?? geoResource.timestamps[0];
				return html`<ba-icon
						.icon="${timeSvg}"
						.title=${translate('layerManager_time_travel_slider')}
						.color=${'var(--secondary-color)'}
						@click=${() => openSlider()}
						class="time-travel-icon"
					></ba-icon>
					<ba-value-select
						.title=${translate('layerManager_time_travel_hint')}
						.values=${geoResource.timestamps}
						.selected=${selected}
						@select=${onTimestampChange}
					></ba-value-select>`;
			};
			return geoResource.hasTimestamps() ? getTimestampControl() : nothing;
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
				layer: { geoResourceId },
				layerItemProperties: { label }
			} = this.getModel();
			openModal(label, html`<ba-georesourceinfo-panel .geoResourceId=${geoResourceId}></ba-georesourceinfo-panel>`);
		};

		const getMenuItems = () => {
			return [
				{ id: 'copy', label: translate('layerManager_to_copy'), icon: cloneSvg, action: cloneLayer, disabled: !layer.constraints.cloneable },
				{
					id: 'zoomToExtent',
					label: translate('layerManager_zoom_to_extent'),
					icon: zoomToExtentSvg,
					action: zoomToExtent,
					disabled: !LayerItem._getZoomToExtentCapableGeoResources().includes(geoResource.getType())
				}
			];
		};

		const leftSide = () => {
			modifyLayer(layer.id, { swipeAlignment: SwipeAlignment.LEFT });
		};
		const bothSide = () => {
			modifyLayer(layer.id, { swipeAlignment: SwipeAlignment.NOT_SET });
		};
		const rightSide = () => {
			modifyLayer(layer.id, { swipeAlignment: SwipeAlignment.RIGHT });
		};

		const getLayerSwipe = () => {
			const direction = layer.constraints.swipeAlignment;
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
			<div class="ba-section divider">
				<div class="ba-list-item">
					<ba-checkbox .title="${getVisibilityTitle()}" class="ba-list-item__text" tabindex="0" .checked=${layer.visible} @toggle=${toggleVisibility}
						>${layerItemProperties.loading
							? html`<ba-spinner .label=${currentLabel}></ba-spinner>`
							: html`${currentLabel} ${getBadges(layerItemProperties.keywords)}`}
					</ba-checkbox>
					${getTimestampContent()}
					<div class="ba-list-item__after clear">
						<ba-icon
							id="remove"
							.icon="${removeSvg}"
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${1.6}
							.title=${translate('layerManager_remove')}
							@click=${remove}
						></ba-icon>
					</div>
					<button id="button-detail" data-test-id class="ba-list-item__after" title="${getCollapseTitle()}" @click="${toggleCollapse}">
						<i class="icon chevron icon-rotate-90 ${classMap(iconCollapseClass)}"></i>
					</button>
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
								.size=${2.6}
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
								.size=${2.6}
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
								.size=${2.6}
								.title=${translate('layerManager_info')}
								.disabled=${!layer.constraints?.metaData}
								@click=${openGeoResourceInfoPanel}
							></ba-icon>
						</div>
						<ba-overflow-menu .type=${MenuTypes.MEATBALL} .items=${getMenuItems()}></ba-overflow-menu>
					</div>
				</div>
				${getLayerSwipe()}
			</div>`;
	}

	set layer(layer) {
		const translate = (key) => this.#translationService.translate(key);
		const geoResource = this.#geoResourceService.byId(layer.geoResourceId);
		const keywords = [...this.#geoResourceService.getKeywords(layer.geoResourceId)];

		if (geoResource instanceof GeoResourceFuture) {
			geoResource.onResolve((resolvedGeoR) => {
				this.signal(Update_Layer_And_LayerProperties, {
					layer: { ...layer },
					changedLayerItemProperties: {
						label: resolvedGeoR.label,
						loading: false
					}
				});
			});
		}

		this.signal(Update_Layer_And_LayerProperties, {
			layer: { ...layer },
			changedLayerItemProperties: {
				label: geoResource instanceof GeoResourceFuture ? translate('layerManager_loading_hint') : geoResource.label,
				loading: geoResource instanceof GeoResourceFuture,
				keywords
			}
		});
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
