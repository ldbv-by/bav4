import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { $injector } from '../../../injection';
import { repeat } from 'lit-html/directives/repeat.js';
import { modifyLayer } from './../../../store/layers/layers.action';
import css from './layerManager.css';

/**
 * Renders a list of layers representing their order on a map and provides
 * actions like reordering, removing and changing visibility and opacity
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 */
export class LayerManager extends BaElement {

	constructor() {
		super();
		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');
		this._translationService = TranslationService;
		this._environmentService = EnvironmentService;
		this._draggableItems = [];
		this._draggedItem = false; /* instead of using e.dataTransfer.get/setData() using internal State to get access for dragged object  */
	}

	/**
	 * @private
	 */
	_resetDraggedItem() {
		this._draggedItem = false;
	}

	/**
	 * @private
	 */
	_buildDraggableItems(layers) {
		const draggableItems = [{ zIndex: 0, isPlaceholder: true, listIndex: 0, isDraggable: false }];
		this._layerCount = layers.length;
		this._resetDraggedItem();
		let j = 0;
		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const old = this._draggableItems.filter(item => item.id === layer.id)[0];
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
		this._draggableItems = draggableItems;
	}

	/**
	 * @override
	 */
	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { active } = state;
		this._buildDraggableItems(active.filter(l => !l.constraints.hidden));

		const isNeighbour = (index, otherIndex) => {
			return index === otherIndex || index - 1 === otherIndex || index + 1 === otherIndex;
		};

		const createLayerElement = (layerItem) => {
			return html`<ba-layer-item .layer=${layerItem} class='layer' draggable data-test-id>
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

			this._draggedItem = layerItem;

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
			if (layerItem.isPlaceholder && this._draggedItem) {
				let newZIndex = layerItem.zIndex;
				if (layerItem.zIndex === this._layerCount - 1) {
					newZIndex = layerItem.zIndex - 1;
				}
				modifyLayer(this._draggedItem.id, { zIndex: newZIndex });
			}
			if (e.target.classList.contains('placeholder')) {
				e.target.classList.remove('over');
			}
			this._resetDraggedItem();
		};
		const onDragOver = (e, layerItem) => {
			e.preventDefault();
			let dropEffect = 'none';

			if (this._draggedItem) {
				if (layerItem.isPlaceholder && !isNeighbour(layerItem.listIndex, this._draggedItem.listIndex)) {
					dropEffect = 'all';
				}
			}
			e.dataTransfer.dropEffect = dropEffect;
		};

		const onDragEnter = (e, layerItem) => {
			if (this._draggedItem) {
				if (layerItem.isPlaceholder && !isNeighbour(layerItem.listIndex, this._draggedItem.listIndex)) {
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

		return html`
			<style>${css}</style>
			<div class="layermanager overflow-container">
				<div class='title'>${translate('layerManager_title')}</div> 
				<ul class='layers'>
                    ${repeat(this._draggableItems, (layerItem) => layerItem.listIndex + '_' + layerItem.id, (layerItem, index) => html`
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
			</div>
		`;
	}

	/**
	  * @override
	  * @param {Object} globalState
	  */
	extractState(globalState) {
		const { layers: { active } } = globalState;

		return { active };
	}

	static get tag() {
		return 'ba-layer-manager';
	}
}
