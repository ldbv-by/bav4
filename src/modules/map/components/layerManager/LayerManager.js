import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { repeat } from 'lit-html/directives/repeat.js';
import { modifyLayer } from './../../store/layers/layers.action';
import css from './layerManager.css';


export class LayerManager extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._draggableItems = [];
		this._draggedItem = false; /* instead of using e.dataTransfer.get/setData() using internal State to get access for dragged object  */
	}	

	_resetDraggedItem() {
		this._draggedItem = false;
	}

	_buildDraggableItems(layers) {
		this._draggableItems  = [{ zIndex: 0, isPlaceholder:true, listIndex:0, isDraggable:false  }];
		this._resetDraggedItem();
		let j = 0;
		for(let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			this._draggableItems.push({ ...layer, isPlaceholder:false, listIndex:j + 1, isDraggable:true });
			this._draggableItems.push({ zIndex:layer.zIndex, isPlaceholder:true, listIndex:j + 2, isDraggable:false });
			j += 2;
		}		
	}

	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { active } = this._state;
		const layerCount = active.length;
		this._buildDraggableItems(active);

		const isNeighbour = (index, otherIndex) => {
			return index === otherIndex || index - 1 === otherIndex || index + 1 === otherIndex;
		};

		const getSlider = (layerItem) => {
			const onChangeOpacity = (e) => {				
				const input = e.target;
				const properties = { opacity: input.value / 100 };
				modifyLayer(layerItem.id, properties);				
			};		

			const onPreventDragging = (e) => {
				e.preventDefault();
				e.stopPropagation();
			};

			return html`<div class='slider-container'>
				<input id=${'opacity-slider' + layerItem.id} 
					type="range" 
					min="1" 
					max="100" 
					value=${layerItem.opacity * 100} 
					class="opacity-slider" 
					draggable=${layerItem.isDraggable} 
					@input=${onChangeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};

		const createLayerElement = (layerItem) => {
			const onToggle = (layerItem) => {
				modifyLayer(layerItem.id, { visible: !layerItem.visible });
			};
			
			const getToggleTitle = (layerItem) => {
				const name = layerItem.label === '' ? layerItem.id : layerItem.label;
				return name + ' - ' + translate('layer_manager_change_visibility');
			};

			const getButtonTitle = () => {				
				return  translate('layer_manager_change_visibility');
			};

			const expandLayer = (layerItem) => {
				const bodyId = '#layer-body_' + layerItem.listIndex;
				const buttonId = '#layer-expand_' + layerItem.listIndex;
				const layerBody = this._root.querySelector(bodyId);
				const expandButton = this._root.querySelector(buttonId);
				if(layerBody.classList.contains('expand')) {
					layerBody.classList.remove('expand');					
					expandButton.classList.remove('layer-expanded');
				}
				else{
					layerBody.classList.add('expand');
					expandButton.classList.add('layer-expanded');
				}
			};

			return html`<div id=${'layer_' + layerItem.listIndex} class='layer'>
							<div class='layer-header'>
								<div class='expand-button'>
									<a title="${getButtonTitle()}" @click="${() => expandLayer(layerItem)}">
									<i id=${'layer-expand_' + layerItem.listIndex} class='icon layer-expand'></i>
									</a>
								</div>
								<span class='layer-label'>${layerItem.label === '' ? layerItem.id : layerItem.label}</span>
								<ba-toggle title='${getToggleTitle(layerItem)}' checked=${layerItem.visible} @toggle=${() => onToggle(layerItem)}></ba-toggle>
							</div>
							<div id=${'layer-body_' + layerItem.listIndex} class='layer-body'>
								${getSlider(layerItem)}
							</div>
						</div>`;
		};

		const createPlaceholderElement = (layerItem) => {
			return html`<div id=${'placeholder_' + layerItem.listIndex} class='placeholder'>							
						</div>`;
		};

		const onDragStart = (e, layerItem) => {
			this._draggedItem = layerItem;
			e.dataTransfer.dropEffect = 'move';
			e.dataTransfer.effectAllowed = 'move';		
		};

		const onDragEnd = (e) => {
			e.preventDefault();
		};

		const onDrop = (e, layerItem) => {
			if(layerItem.isPlaceholder && this._draggedItem) {
				modifyLayer(this._draggedItem.id, { zIndex:layerItem.zIndex });
			}
			if(e.target.classList.contains('placeholder')) {
				e.target.classList.remove('over');				
			}
			this._resetDraggedItem();
		};
		const onDragOver = (e, layerItem) => {
			e.preventDefault();			
			let dropEffect = 'none';
			
			if(this._draggedItem) {			
				if(layerItem.isPlaceholder && !isNeighbour(layerItem.listIndex, this._draggedItem.listIndex)) {
					dropEffect = 'all';
				}
			}
			e.dataTransfer.dropEffect = dropEffect;
		};

		const onDragEnter = (e, layerItem) => {
			if(this._draggedItem) {			
				if(layerItem.isPlaceholder && !isNeighbour(layerItem.listIndex, this._draggedItem.listIndex)) {
					e.target.classList.add('over');
				}
			}
		};
		const onDragLeave = (e) => {			
			e.stopPropagation();
			if(e.target) {
				if(e.target.classList.contains('over')) {
					e.target.classList.remove('over');					
				}			
			}			
		};

		return html`
			<style>${css}</style>
			<div class="layermanager overflow-container">
				<div class='title'>${translate('layer_manager_title')} (${layerCount})</div> 
				<ul class='layers'>
                    ${repeat(this._draggableItems, (layerItem) => layerItem.listIndex, (layerItem, index) => html`
					<li draggable=${layerItem.isDraggable} 
						@dragstart=${(e) => onDragStart(e, layerItem)} 
						@dragend=${onDragEnd}
						@drop=${(e) => onDrop(e, layerItem)}
						@dragover=${(e) => onDragOver(e, layerItem)}
						@dragenter=${(e) => onDragEnter(e, layerItem)}
						@dragleave=${onDragLeave}
						index=${index}> ${layerItem.isPlaceholder ? createPlaceholderElement(layerItem) : createLayerElement(layerItem)}						
					</li>`)}
                </ol>	
			</div>
		`;
	}
    
	/**
 * @override
 * @param {Object} store 
 */
	extractState(store) {
		const { layers: { active } } = store;
		
		return { active };
	}
    
	static get tag() {
		return 'ba-layer-manager';
	}
}