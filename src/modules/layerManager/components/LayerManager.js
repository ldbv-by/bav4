import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { repeat } from 'lit-html/directives/repeat.js';
import { modifyLayer, removeLayer } from './../../../store/layers/layers.action';
import css from './layerManager.css';
import { MvuElement } from '../../MvuElement';


const Update_Draggable_Items = 'update_draggable_items';
const Update_Collapse_Change = 'update_collapse_change';
const Update_Dragged_Item = 'update_dragged_item';
/**
 * Renders a list of layers representing their order on a map and provides
 * actions like reordering, removing and changing visibility and opacity
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 */
export class LayerManager extends MvuElement {

	constructor() {
		super({
			draggableItems: [],
			draggedItem: false/* instead of using e.dataTransfer.get/setData() using internal State to get access for dragged object  */
		});
		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');
		this._translationService = TranslationService;
		this._environmentService = EnvironmentService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Draggable_Items:
				return {
					...model, draggableItems: [...data]
				};
			case Update_Collapse_Change:
				return { ...model, draggableItems: model.draggableItems.map(i => i.id === data.id ? data : i) };
			case Update_Dragged_Item:
				return { ...model, draggedItem: data };
		}
	}

	onInitialize() {
		this.observe(store => store.layers.active, active => this._buildDraggableItems(active.filter(l => !l.constraints.hidden)));
	}


	/**
 * @private
 */
	_buildDraggableItems(layers) {
		const draggableItems = [{ zIndex: 0, isPlaceholder: true, listIndex: 0, isDraggable: false }];
		this._layerCount = layers.length;
		this.signal(Update_Dragged_Item, false);

		let j = 0;
		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const old = this.getModel().draggableItems.filter(item => item.id === layer.id)[0];
			const displayProperties = {
				collapsed: true,
				visible: layer.visible
			};
			if (old) {
				displayProperties.collapsed = old.collapsed;
			}
			draggableItems.push({ ...layer, isPlaceholder: false, listIndex: j + 1, isDraggable: true, ...displayProperties });
			draggableItems.push({ zIndex: layer.zIndex + 1, isPlaceholder: true, listIndex: j + 2, isDraggable: false });
			j += 2;
		}
		this.signal(Update_Draggable_Items, draggableItems);
	}

	/**
 * @override
 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { draggableItems, draggedItem } = model;
		const isNeighbour = (index, otherIndex) => {
			return index === otherIndex || index - 1 === otherIndex || index + 1 === otherIndex;
		};

		const onCollapseChanged = (e) => {
			this.signal(Update_Collapse_Change, e.detail.layer);
		};

		const createLayerElement = (layerItem) => {
			return html`<ba-layer-item .layer=${layerItem} class='layer' draggable data-test-id @collapse=${onCollapseChanged}>
					</ba-layer-item>`;
		};

		const createPlaceholderElement = (layerItem) => {
			return html`<div id=${'placeholder_' + layerItem.listIndex} class='placeholder'></div>`;
		};

		const createIndexNumberForPlaceholder = (listIndex, layerItem) => {
			const isHigherThenDrag = (layerItem.listIndex >= listIndex) ? 1 : 0;
			return listIndex / 2 + isHigherThenDrag;
		};

		const onDragStart = (e, layerItem) => {
			if (this._environmentService.isTouch()) {
				return;
			}

			this.signal(Update_Dragged_Item, layerItem);

			e.target.classList.add('isdragged');
			e.dataTransfer.dropEffect = 'move';
			e.dataTransfer.effectAllowed = 'move';
			this.shadowRoot.querySelectorAll('.placeholder').forEach(p => {
				const listIndex = Number.parseFloat(p.id.replace('placeholder_', ''));
				p.innerHTML = createIndexNumberForPlaceholder(listIndex, layerItem);
				if (!isNeighbour(listIndex, layerItem.listIndex)) {
					p.classList.add('placeholder-active');
				}
			});
		};

		const onDragEnd = (e) => {
			e.target.classList.remove('isdragged');
			e.preventDefault();
			this.shadowRoot.querySelectorAll('.placeholder').forEach(p => p.classList.remove('placeholder-active'));
		};

		const onDrop = (e, layerItem) => {
			if (layerItem.isPlaceholder && draggedItem) {
				let newZIndex = layerItem.zIndex;
				if (layerItem.zIndex === this._layerCount - 1) {
					newZIndex = layerItem.zIndex - 1;
				}
				modifyLayer(draggedItem.id, { zIndex: newZIndex });
			}
			if (e.target.classList.contains('placeholder')) {
				e.target.classList.remove('over');
			}
			this.signal(Update_Dragged_Item, false);
		};
		const onDragOver = (e, layerItem) => {
			e.preventDefault();
			let dropEffect = 'none';

			if (draggedItem) {
				if (layerItem.isPlaceholder && !isNeighbour(layerItem.listIndex, draggedItem.listIndex)) {
					dropEffect = 'all';
				}
			}
			e.dataTransfer.dropEffect = dropEffect;
		};

		const onDragEnter = (e, layerItem) => {
			if (draggedItem) {
				if (layerItem.isPlaceholder && !isNeighbour(layerItem.listIndex, draggedItem.listIndex)) {
					e.target.classList.add('over');
				}
			}
		};
		const onDragLeave = (e) => {
			e.stopPropagation();
			if (e.target) {
				if (e.target.classList.contains('over')) {
					e.target.classList.remove('over');
				}
			}
		};


		const buttons = this._getButtons(model);

		return html`
			<style>${css}</style>
			<div class="layermanager overflow-container">
				<div class='title'>${translate('layerManager_title')}</div> 
				<ul class='layers'>
                    ${repeat(draggableItems, (layerItem) => layerItem.listIndex + '_' + layerItem.id, (layerItem, index) => html`
					<li draggable=${layerItem.isDraggable} 
						@dragstart=${(e) => onDragStart(e, layerItem)} 
						@dragend=${onDragEnd}
						@drop=${(e) => onDrop(e, layerItem)}
						@dragover=${(e) => onDragOver(e, layerItem)}
						@dragenter=${(e) => onDragEnter(e, layerItem)}
						@dragleave=${onDragLeave}
						index=${index}> ${layerItem.isPlaceholder ? createPlaceholderElement(layerItem) : createLayerElement(layerItem)}						
					</li>`)}
                </ul>	
				${buttons}				
			</div>
		`;
	}

	_getButtons(model) {
		const translate = (key) => this._translationService.translate(key);
		const { draggableItems } = model;
		const expandAll = () => {
			this.signal(Update_Draggable_Items, draggableItems.map(i => i.isPlaceholder ? i : { ...i, collapsed: false }));
		};

		const collapseAll = () => {
			this.signal(Update_Draggable_Items, draggableItems.map(i => i.isPlaceholder ? i : { ...i, collapsed: true }));
		};

		const removeAll = () => {
			draggableItems.filter(i => !i.isPlaceholder).forEach(i => removeLayer(i.id));
		};

		const draggableItemsExpandable = draggableItems.some(i => i.collapsed);
		const expandOrCollapseLabel = draggableItemsExpandable ? translate('layerManager_expand_all') : translate('layerManager_collapse_all');
		const expandOrCollapseAction = draggableItemsExpandable ? expandAll : collapseAll;

		return draggableItems.filter(i => !i.isPlaceholder).length > 0
			? html`<div class='layermanager__actions'>					
					<ba-button class='layermanager__expandOrCollapse' .label=${expandOrCollapseLabel} .type=${'secondary'} @click=${expandOrCollapseAction} style='border-right: 1px dotted var(--header-background-color);' ></ba-button>							
					<ba-button .label=${translate('layerManager_remove_all')} .type=${'secondary'} @click=${removeAll}></ba-button>	
					<div>`
			: nothing;
	}

	static get tag() {
		return 'ba-layer-manager';
	}
}
