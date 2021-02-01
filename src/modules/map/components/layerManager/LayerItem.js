import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './layerItem.css';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import { modifyLayer, removeLayer } from './../../store/layers/layers.action';

export class LayerItem extends BaElement {

	constructor() {
		super();        
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;	
		this._layer = { id:'', label:'', visible:true, collapsed:true, opacity:1 };	
	}
    
    
	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);
        
		const currentLabel = this._layer.label === '' ? this._layer.id : this._layer.label;
		
		const getCollapseTitle = () => {				
			return  this._layer.collapsed ? translate('layer_item_expand') : translate('layer_item_collapse');
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
			this._layer.collapsed = !this._layer.collapsed ;
			this.render();
		};
		const increaseIndex = () => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { zIndex: this._layer.zIndex + 1 });
		};
		const decreaseIndex = () => {
			//state store change -> implicit call of #render()
			if(this._layer.zIndex - 1 >= 0) {
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
					title=${translate('layer_item_opacity')}
					max="100" 
					value=${this._layer.opacity * 100} 
					class='opacity-slider' 
					draggable='true' 
					@input=${changeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};
        
        
		const getVisibilityTitle = () => {
			return currentLabel + ' - ' + translate('layer_item_change_visibility');
		};
        
		const iconCollapseClass = {
			iconexpand:!this._layer.collapsed
		};
        
		const bodyCollapseClass = {
			expand:!this._layer.collapsed
		};		

		
		return html`
        <style>${css}</style>
        <div class='layer'>
            <div class='layer-header'>
                <div class='collapse-button'>
                    <a title="${getCollapseTitle()}" @click="${toggleCollapse}">
                        <i class='icon chevron ${classMap(iconCollapseClass)}'></i>
                    </a>
                </div>
                <span class='layer-label'>${currentLabel}</span>
                <ba-toggle title='${getVisibilityTitle()}' checked=${this._layer.visible} @toggle=${toggleVisibility}></ba-toggle>
            </div>
			<div class='layer-body ${classMap(bodyCollapseClass)}'>			
				${getSlider()}
				<div class='layer-move-buttons'> 
					<a class='increase button' title=${translate('layer_item_move_up')} @click="${increaseIndex}">
						<i class='arrow-icon arrow-up'></i>
					</a>
					<a class='decrease button' title=${translate('layer_item_move_down')} @click="${decreaseIndex}">
						<i class='arrow-icon arrow-down'></i>
					</a>
				</div>
				<div class='layer-remove'>
					<a class='remove button' title=${translate('layer_item_remove')} @click="${remove}">
						<i class='remove-icon'></i>
					</a>
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