import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './layerItem.css';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import { modifyLayer, removeLayer } from './../../store/layers.action';
import arrowUpSvg from './assets/arrow-up-short.svg';
import arrowDownSvg from './assets/arrow-down-short.svg';
import removeSvg from './assets/trash.svg';
import infoSvg from './assets/info.svg';

/**
 * private Element of LayerManager to render a layer state and its possible actions
 * (remove,change visibility and opacity)
 * @class
 * @author thiloSchlemmer
 * @author tAulinger 
 */
export class LayerItem extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._layer = { id: '', label: '', visible: true, collapsed: true, opacity: 1 };
	}


	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const currentLabel = this._layer.label === '' ? this._layer.id : this._layer.label;

		const getCollapseTitle = () => {
			return this._layer.collapsed ? translate('map_layerManager_expand') : translate('map_layerManager_collapse');
		};

		const changeOpacity = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { opacity: parseInt(event.target.value) / 100 });
		};
		const toggleVisibility = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { visible: event.detail.checked });
		};
		const toggleCollapse = () => {
			//change of local state -> explicit call of #render() 
			this._layer.collapsed = !this._layer.collapsed;
			this.render();
		};
		const increaseIndex = () => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { zIndex: this._layer.zIndex + 1 });
		};
		const decreaseIndex = () => {
			//state store change -> implicit call of #render()
			if (this._layer.zIndex - 1 >= 0) {
				modifyLayer(this._layer.id, { zIndex: this._layer.zIndex - 1 });
			}
		};

		const remove = () => {
			//state store change -> implicit call of #render()
			removeLayer(this._layer.id);
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
					title=${translate('map_layerManager_opacity')}
					max="100" 
					value=${this._layer.opacity * 100} 
					class='opacity-slider' 
					draggable='true' 
					@input=${changeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};


		const getVisibilityTitle = () => {
			return this._layer.label + ' - ' + translate('map_layerManager_change_visibility');
		};

		const iconCollapseClass = {
			iconexpand: !this._layer.collapsed
		};

		const bodyCollapseClass = {
			expand: !this._layer.collapsed
		};


		return html`
        <style>${css}</style>
        <div class='layer'>
		<div class='layer-content'>
			<div class='layer-header'>
				<span class='layer-header__pre'>
					<ba-toggle title='${getVisibilityTitle()}' checked=${this._layer.visible} @toggle=${toggleVisibility}></ba-toggle>
				</span>					
				<span  class='layer-header__text'>
					${currentLabel}
				</span>											
				<a class='layer-header__after collapse-button' title="${getCollapseTitle()}" @click="${toggleCollapse}">
					<i class='icon chevron ${classMap(iconCollapseClass)}'></i>
				</a>   
			</div>
			<div class='layer-body  ${classMap(bodyCollapseClass)}'>	
				<span class='layer-body__pre'>				
				</span>		
				<div class=' layer-buttons divider'> 
					<div>
						<ba-icon id='increase' icon='${arrowUpSvg}' color=var(--icon-default-color) color_hover=var(--text-default-color) size=2 title=${translate('map_layerManager_move_up')} @click=${increaseIndex}></ba-icon>					
						<ba-icon id='decrease' icon='${arrowDownSvg}' color=var(--icon-default-color) color_hover=var(--text-default-color) size=2 title=${translate('map_layerManager_move_down')} @click=${decreaseIndex}></ba-icon>					
						<ba-icon id='info' icon='${infoSvg}' color=var(--icon-default-color) color_hover=var(--text-default-color) size=2 ></ba-icon>					
						<ba-icon id='remove' icon='${removeSvg}' color=var(--icon-default-color) color_hover=var(--text-default-color) size=2 title=${translate('map_layerManager_remove')} @click=${remove}></ba-icon>					
					</div>		
					<div class='layer-body__slider'>						
						${getSlider()}			
					</div>		
				</div>				
            </div>
		</div>
        </div>`;
	}

	static get tag() {
		return 'ba-layer-item';
	}

	set layer(value) {
		this._layer = value;
	}
}