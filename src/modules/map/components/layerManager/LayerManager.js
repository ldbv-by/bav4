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
		this._layerItems = [];
	}

	_buildLayerItems(layers) {
		let layerItems = [{ isPlaceholder:true, listIndex:0 }];
		
		let j = 0;
		for(let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			layerItems.push({ ...layer, isPlaceholder:false, listIndex:j + 1 });
			layerItems.push({ zIndex:layer.zIndex, isPlaceholder:true, listIndex:j + 2 });
			j += 2;
		}
		return layerItems;
	}

	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { active } = this._state;
		const layerCount = active.length;
		this._layerItems = this._buildLayerItems(active);

		const onToggle = (layer) => {
			modifyLayer(layer.id, { visible: !layer.visible });
		};
		
		const getToggleTitle = (layer) => {
			const name = layer.label === '' ? layer.id : layer.label;
			return name + ' - ' + translate('layer_manager_change_visibility');
		};

		const getSlider = (layer) => {
			const onChangeOpacity = (e) => {				
				const input = e.target;
				const properties = { opacity: input.value / 100 };
				modifyLayer(layer.id, properties);				
			};

			return html`<div class='slider-container'>
				<input id=${'opacity-slider' + layer.id} type="range" min="1" max="100" value=${layer.opacity * 100} class="opacity-slider" @input=${onChangeOpacity} id="myRange"></div>`;

		};

		const createLayerElement = (layerItem) => {
			return html`<div class='layer'>
							<div class='layer-header'>
								<span class='layer-label'>${layerItem.label === '' ? layerItem.id : layerItem.label}</span>
								<ba-toggle title='${getToggleTitle(layerItem)}' checked=${layerItem.visible} @toggle=${() => onToggle(layerItem)}></ba-toggle>
							</div>
							<div class='layer-body'>
								${getSlider(layerItem)}
							</div>
						</div>`;
		};

		const createPlaceholderElement = (layerItem) => {
			return html`<div id=${'placeholder_' + layerItem.listIndex} class='placeholder'>							
						</div>`;
		};

		const onDragStart = (e, layerItem) => {
			const thatId = layerItem.listIndex;
			const thatIdFallback = 'thatid_' +  thatId;
			e.dataTransfer.dropEffect = 'move';
			e.dataTransfer.effectAllowed = 'move';

			e.dataTransfer.setData('thatid', '' + thatId);
			// Hack to overcome security-restrictions on dragenter-event
			// with empty datatransfer-object
			e.dataTransfer.setData(thatIdFallback, 'ohno!');			
		};

		const onDragEnd = (e) => {
			e.preventDefault();
			//console.log('dragend:', e);
		};

		const onDrop = (e, layerItem) => {
			if(layerItem.isPlaceholder ) {
				const afterId = layerItem.listIndex;
				let thatId = e.dataTransfer.getData('thatid');
				if (thatId == '') {
				// Hack to overcome security-restrictions on dragenter-event
				// with empty datatransfer-object
					e.dataTransfer.types.forEach((t) => {					
						if (t.startsWith('thatid_')) {
							const candidate = t.split('_')[1];			
							if(candidate) {
								thatId = candidate;												
							}						
						}									
					});
				}		
				
				console.log('thatId, afterId:' + thatId + ',' + afterId);

				const thatLayer = this._layerItems[parseInt(thatId)];
				const afterLayer = this._layerItems[afterId]; 
			
			
				console.log('layer change zIndex: ' + thatLayer.id + ',' + afterLayer.zIndex);
				modifyLayer(thatLayer.id, { zIndex:afterLayer.zIndex });
			}
			if(e.target.classList.contains('placeholder')) {
				e.target.classList.remove('over');
			}
		};
		const onDragOver = (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			//console.log('dragover:', e);
		};

		const onDragEnter = (e, layerItem) => {
			const thisId = layerItem.listIndex;
			let thatId = e.dataTransfer.getData('thatid');
			
			if (thatId == '') {
				// Hack to overcome security-restrictions on dragenter-event
				// with empty datatransfer-object
				e.dataTransfer.types.forEach((t) => {					
					if (t.startsWith('thatid_')) {
						const candidate = t.split('_')[1];			
						if(candidate) {
							thatId = candidate;												
						}						
					}									
				});
			}
			e.dataTransfer.dropEffect = 'move';
			const isNeighbour = (thisId, thatId) => {
				return thisId === thatId || 
						thisId - 1 === thatId ||
						thisId + 1 === thatId;
			};
			if(e.target.classList.contains('placeholder') && !isNeighbour(thisId, parseInt(thatId))) {
				e.target.classList.add('over');
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
                    ${repeat(this._layerItems, (layerItem) => layerItem.listIndex, (layerItem, index) => html`
					<li draggable='true' 
						@dragstart=${(e) => onDragStart(e, layerItem)} 
						@dragend=${onDragEnd}
						@drop=${(e) => onDrop(e, layerItem)}
						@dragover=${onDragOver}
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