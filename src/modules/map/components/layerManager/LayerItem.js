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
		this._title = this.getAttribute('title') || '';
		this._draggable = this.getAttribute('draggable') === 'true';
		this._visible = this.getAttribute('visible') === 'true';
		this._onVisibilityChanged = () => {};
		this._collapsed = this.getAttribute('collapsed') === 'true';
		this._onCollapsed = () => { };       
		this._onMove = () => {}; 
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
					draggable=${this._draggable} 
					@input=${onChangeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};
        
		const getCollapseTitle = () => {				
			return  translate('layer_item_collapse');
		};
        
		const onCollapse = () => {
			this._collapsed = !this._collapsed;
			this.dispatchEvent(new CustomEvent('collapse', {
				detail: { collapse: this._collapsed }
			}));            
			this._onCollapsed({
				detail: { collapse: this._collapsed }
			});
			this.render();
		};

		const onMoveUp = () => {
			this.dispatchEvent(new CustomEvent('move', {
				detail: { move: +1 }
			}));            
			this._onMove(+1);
			this.render();
		};

		const onMoveDown = () => {
			this.dispatchEvent(new CustomEvent('move', {
				detail: { move: -1 }
			}));            
			this._onMove( {
				detail: { move: -1 }
			});
			this.render();
		};
        
		const onVisible = () => {
			this._visible = !this._visible;
            
			this.dispatchEvent(new CustomEvent('visible', {
				detail: { visible: this._visible }
			}));            
			this._onVisibilityChanged({
				detail: { visible: this._visible }
			});
			this.render();
		};
        
		const getVisibilityTitle = () => {
			return this.title + ' - ' + translate('layer_item_change_visibility');
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
                <span class='layer-label'>${this.title}</span>
                <ba-toggle title='${getVisibilityTitle()}' checked=${this._visible} @toggle=${onVisible}></ba-toggle>
            </div>
			<div class='layer-body ${classMap(bodyCollapseClass)}'>
			
				${getSlider()}
				<div class='layer-move-buttons'> 
					<a class='button' title="move up" @click="${onMoveUp}">
						<i class='arrow-icon arrow-up'></i>
					</a>
					<a class='button' title="move down" @click="${onMoveDown}">
						<i class='arrow-icon arrow-down'></i>
					</a>
				</div>
            </div>
        </div>`;
	}
    
	static get observedAttributes() {
		return ['title', 'collapsed', 'visible', 'opacity', 'draggable'];
	}

	static get tag() {
		return 'ba-layer-item';
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'title':
				this._title = newValue;
				this.render();
				break;
			case 'collapsed':
				this._collapsed = newValue === '' ? true : (newValue === 'true');
				this.render();
				break;
			case 'visible':
				this._visible = newValue === '' ? true : (newValue === 'true');
				this.render();
				break;
			case 'opacity':
				this._opacity = parseInt(newValue);
				this.render();
				break;
			case 'draggable':
				this._draggable = newValue === '' ? true : (newValue === 'true');
				this.render();
				break;				
		}
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

	set onMove(callback) {
		this._onMove = callback;
	}

	get onMove() {
		return this._onMove;
	}

	
}