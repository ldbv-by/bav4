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
			this._draggableItems.push({ ...layer, isPlaceholder:false, listIndex:j + 1, isDraggable:true, collapsed:true });
			this._draggableItems.push({ zIndex:layer.zIndex + 1, isPlaceholder:true, listIndex:j + 2, isDraggable:false });
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

		const createLayerElement = (layerItem) => {
			const name = layerItem.label === '' ? layerItem.id : layerItem.label;

			const onVisible = (e, layerItem) => {
				modifyLayer(layerItem.id, { visible: e.detail.visible });
			};
			
			const onOpacity = (e, layerItem) => {
				modifyLayer(layerItem.id, { opacity: e.detail.opacity / 100 });
			};

			const onCollapse = () => (e, layerItem) => {
				layerItem.collapsed = e.detail.collapsed;
			};

			return html`<ba-layer-item class='layer' name=${name} 
					opacity=${layerItem.opacity * 100}
					collapsed=${layerItem.collapsed}
					draggable='true'
					@visible=${(e) => onVisible(e, layerItem)}
					@opacity=${(e) => onOpacity(e, layerItem)}
					@collapse=${(e) => onCollapse(e, layerItem)}
					>
					</ba-layer-item>`;
			
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