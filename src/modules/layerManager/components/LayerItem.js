import { html, nothing } from 'lit-html';
import css from './layerItem.css';
import { $injector } from '../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import { addLayer, modifyLayer, removeLayer } from './../../../store/layers/layers.action';
import arrowUpSvg from './assets/arrow-up-short.svg';
import arrowDownSvg from './assets/arrow-down-short.svg';
import cloneSvg from './assets/clone.svg';
import zoomToExtentSvg from './assets/zoomToExtent.svg';
import removeSvg from './assets/trash.svg';
import infoSvg from './assets/info.svg';
import { AbstractMvuContentPanel } from '../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { openModal } from '../../../../src/store/modal/modal.action';
import { createUniqueId } from '../../../utils/numberUtils';
import { fitLayer } from '../../../store/position/position.action';
import { GeoResourceFuture, VectorGeoResource } from '../../../domain/geoResources';
import { MenuTypes } from '../../commons/components/overflowMenu/OverflowMenu';


const Update_Layer = 'update_layer';
const Update_Layer_Collapsed = 'update_layer_collapsed';

/**
 * Child element of the LayerManager. Represents one layer and its state.
 * Events:
 * - onCollapse()
 *
 * Properties:
 * - `layer`
 *
 *
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 * @author costa_gi
 */
export class LayerItem extends AbstractMvuContentPanel {

	constructor() {
		super({
			layer: null
		});
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._geoResourceService = GeoResourceService;


		this._onCollapse = () => { };
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {

			case Update_Layer:
				return {
					...model,
					layer: {
						...data,
						visible: data?.visible ?? true,
						collapsed: data?.collapsed ?? true,
						opacity: data?.opacity ?? 1,
						loading: data?.loading ?? false
					}
				};
			case Update_Layer_Collapsed:
				return { ...model, layer: { ...model.layer, collapsed: data } };
		}
	}

	onInitialize() {
		this.observe(state => state.geoResources.changed, (changed) => {
			if (this.getModel().layer.geoResourceId === changed.payload) {
				const geoResource = this._geoResourceService.byId(changed.payload);
				this.signal(Update_Layer, { ...this.getModel().layer, label: geoResource.label });
			}
		}, false);
	}


	/**
* @override
*/
	onAfterRender(firsttime) {
		if (firsttime) {
			/* grab sliders on page */
			const sliders = this._root.querySelectorAll('input[type="range"]');

			/* take a slider element, return a percentage string for use in CSS */
			const rangeToPercent = slider => {
				const max = slider.getAttribute('max') || 100;
				const percent = slider.value / max * 100;
				return `${parseInt(percent)}%`;
			};

			/* on page load, set the fill amount */
			sliders.forEach(slider => {
				slider.style.setProperty('--track-fill', rangeToPercent(slider));

				/* when a slider changes, update the fill prop */
				slider.addEventListener('input', e => {
					e.target.style.setProperty('--track-fill', rangeToPercent(e.target));
				});
			});
		}
	}

	/**
 * @override
 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { layer } = model;

		if (!layer) {
			return nothing;
		}
		const geoResource = this._geoResourceService.byId(layer.geoResourceId);
		// const currentLabel = (geoResource instanceof GeoResourceFuture) ? 'Loading Toddo i18n' : geoResource.label;
		const currentLabel = layer.label;
		const getCollapseTitle = () => {
			return layer.collapsed ? translate('layerManager_expand') : translate('layerManager_collapse');
		};

		const changeOpacity = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(layer.id, { opacity: parseInt(event.target.value) / 100 });
		};
		const toggleVisibility = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(layer.id, { visible: event.detail.checked });
		};
		const toggleCollapse = (e) => {
			const collapsed = !layer.collapsed;
			this.signal(Update_Layer_Collapsed, collapsed);
			this.dispatchEvent(new CustomEvent('collapse', {
				detail: {
					layer: { ...layer, collapsed: collapsed }
				}
			}));
			this._onCollapse(e);
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
			addLayer(`${layer.geoResourceId}_${createUniqueId()}`, { ...layer, geoResourceId: layer.geoResourceId, label: `${layer.label} (${translate('layerManager_layer_copy')})`, zIndex: layer.zIndex + 1 });
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

			return html`<div class='slider-container'>
				<input  
					type="range" 
					min="1" 
					title=${translate('layerManager_opacity')}
					max="100" 
					value=${layer.opacity * 100} 
					class='opacity-slider' 
					draggable='true' 
					@input=${changeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};


		const getVisibilityTitle = () => {
			return layer.label + ' - ' + translate('layerManager_change_visibility');
		};

		const iconCollapseClass = {
			iconexpand: !layer.collapsed
		};

		const bodyCollapseClass = {
			iscollapse: layer.collapsed
		};

		const openGeoResourceInfoPanel = async () => {
			openModal(layer.label, this._getInfoPanelFor(layer.geoResourceId));
		};

		const getMenuItems = () => {
			return [
				{ id: 'copy', label: translate('layerManager_to_copy'), icon: cloneSvg, action: cloneLayer, disabled: !layer.constraints?.cloneable },
				{ id: 'zoomToExtent', label: translate('layerManager_zoom_to_extent'), icon: zoomToExtentSvg, action: zoomToExtent, disabled: !(geoResource instanceof VectorGeoResource) },
				{ id: 'info', label: 'Info', icon: infoSvg, action: openGeoResourceInfoPanel, disabled: !layer.constraints?.metaData }
			];
		};

		return html`
        <style>${css}</style>
        <div class='ba-section divider'>
            <div class='ba-list-item'>          

                    <ba-checkbox .title='${getVisibilityTitle()}'  class='ba-list-item__text' tabindex='0' .checked=${layer.visible} @toggle=${toggleVisibility}>${currentLabel}${layer.loading ? html`<ba-spinner .label=${' '}></ba-spinner>` : nothing}</ba-checkbox>                                                   
                                       
                <button id='button-detail' data-test-id class='ba-list-item__after' title="${getCollapseTitle()}" @click="${toggleCollapse}">
                    <i class='icon chevron icon-rotate-90 ${classMap(iconCollapseClass)}'></i>
                </button>   
            </div>
            <div class='collapse-content ba-list-item  ${classMap(bodyCollapseClass)}'>                                                                                                                                                                
				${getSlider()}   
				<div>                                                                                              
					<ba-icon id='increase' .icon='${arrowUpSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} .title=${translate('layerManager_move_up')} @click=${increaseIndex}></ba-icon>                    				
				</div>                                                                                              
				<div>                                                                                              
					<ba-icon id='decrease' .icon='${arrowDownSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} .title=${translate('layerManager_move_down')} @click=${decreaseIndex}></ba-icon>                                
				</div>                                                                          
				<div>                                                                                              
					<ba-icon id='remove' .icon='${removeSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} .title=${translate('layerManager_remove')} @click=${remove}></ba-icon>               
				</div>
				<ba-overflow-menu .type=${MenuTypes.MEATBALL} .items=${getMenuItems()} ></ba-overflow-menu>
            </div>
        </div>`;
	}

	_getInfoPanelFor(georesourceId) {
		return html`<ba-georesourceinfo-panel .geoResourceId=${georesourceId}></ba-georesourceinfo-panel>`;
	}

	set layer(value) {
		const translate = (key) => this._translationService.translate(key);
		const geoResource = this._geoResourceService.byId(value.geoResourceId);

		if (geoResource instanceof GeoResourceFuture) {
			geoResource.onResolve(resolvedGeoR => this.signal(Update_Layer,
				{
					...value,
					label: resolvedGeoR.label,
					loading: false
				}));
		}
		this.signal(Update_Layer, {
			...value,
			label: geoResource instanceof GeoResourceFuture ? translate('layerManager_loading_hint') : geoResource.label,
			loading: geoResource instanceof GeoResourceFuture
		});
	}

	/**
	 * @property {function} onCollapse - Callback function
	  */
	set onCollapse(callback) {
		this._onCollapse = callback;
	}


	static get tag() {
		return 'ba-layer-item';
	}
}
