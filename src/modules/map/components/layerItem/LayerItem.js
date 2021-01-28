import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './layerItem.css';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';

export class LayerItem extends BaElement {

	constructor() {
		super();        
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onOpacityChanged = () => { };
		this._opacity = parseInt(this.getAttribute('opacity')) || 100;
		this.name = this.getAttribute('name') || '';
		this.draggable = this.getAttribute('draggable') === 'true';
		this._visible = this.getAttribute('visible') === 'true' || true;
		this._onVisibilityChanged = () => {};
		this._collapsed = this.getAttribute('collapsed') === 'true' || true;
		this._onCollapsed = () => { };        
	}
    
    
	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);
        
		const getSlider = () => {
			const onChangeOpacity = (e) => {                	
				const input = e.target;	
				this.dispatchEvent(new CustomEvent('opacity', {
					detail: { opacity: parseInt(input.value) }
				}));						
				this.opacity = parseInt(input.value);
				this._onOpacityChanged( input.value);				
			};		

			const onPreventDragging = (e) => {
				e.preventDefault();
				e.stopPropagation();
			};

			return html`<div class='slider-container'>
				<input  
					type="range" 
					min="1" 
					max="100" 
					value=${this._opacity} 
					class="opacity-slider" 
					draggable=${this.draggable} 
					@input=${onChangeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};
        
		const getCollapseTitle = () => {				
			return  translate('layer_item_collapse');
		};
        
		const onCollapse = () => {
			this.collapsed = !this._collapsed;
			this.dispatchEvent(new CustomEvent('collapse', {
				detail: { collapse: this._collapsed }
			}));            
			this._onCollapsed(this._collapsed);
		};
        
		const onVisible = () => {
			this.visible = !this._visible;
            
			this.dispatchEvent(new CustomEvent('visible', {
				detail: { visible: this._visible }
			}));            
			this._onVisibilityChanged(this._visible);
		};
        
		const getVisibilityTitle = () => {
			return this.name + ' - ' + translate('layer_item_change_visibility');
		};
        
		const iconCollapseClass = {
			iconexpand:!this._collapsed
		};
        
		const bodyCollapseClass = {
			expand:!this._collapsed
		};
        
		return html`
        <style>${css}</style>
        <div class='layer'>
            <div class='layer-header'>
                <div class='collapse-button'>
                    <a title="${getCollapseTitle()}" @click="${onCollapse}">
                        <i class='icon chevron ${classMap(iconCollapseClass)}'></i>
                    </a>
                </div>
                <span class='layer-label'>${this._name}</span>
                <ba-toggle title='${getVisibilityTitle()}' checked=${this._visible} @toggle=${onVisible}></ba-toggle>
            </div>
            <div class='layer-body ${classMap(bodyCollapseClass)}'>
                ${getSlider()}
            </div>
        </div>`;
	}
    
	static get observedAttributes() {
		return ['name', 'collapsed', 'visible', 'opacity', 'draggable'];
	}

	static get tag() {
		return 'ba-layer-item';
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'name':
				this.name = newValue;
				break;
			case 'collapsed':
				this.collapsed = (newValue === 'true');
				break;
			case 'visible':
				this.visible = (newValue === 'true');
				break;
			case 'opacity':
				this.opacity = parseInt(newValue);
				break;
			case 'draggable':
				this.draggable = (newValue === 'true');
				break;
		}
	}
    
	set name(value) {
		if (value !== this._name) {
			this._name = value;
			this.render();
		}
	}
    
	get name() {
		return this._name;
	}
    
	set collapsed(value) {
		if (value !== this._collapsed) {
			this._collapsed = value;
			this.render();
		}
	}

	get collapsed() {
		return this._collapsed;
	}
    
	set draggable(value) {
		if (value !== this._draggable) {
			this._draggable = value;
			this.render();
		}
	}

	get draggable() {
		return this._draggable;
	}
    
	set visible(value) {
		if (value !== this._visible) {
			this._visible = value;
			this.render();
		}
	}

	get visible() {
		return this._visible;
	}
    
	set opacity(value) {
		if (value !== this._opacity) {
			this._opacity = value;
			this.render();
		}
	}

	get opacity() {
		return this._opacity;
	}    

	set onOpacityChanged(callback) {
		this._onOpacityChanged = callback;
	}

	get onOpacityChanged() {
		return this._onOpacityChanged;
	}
    
	set onVisibilityChanged(callback) {
		this._onVisibilityChanged = callback;
	}

	get onVisibilityChanged() {
		return this._onVisibilityChanged;
	}
    
	set onCollapsed(callback) {
		this._onCollapsed = callback;
	}

	get onCollapsed() {
		return this._onCollapsed;
	}

	
}