/**
 * @module modules/layerManager/components/LayerManager
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { repeat } from 'lit-html/directives/repeat.js';
import { modifyLayer, removeLayer } from './../../../store/layers/layers.action';
import { toggleCurrentTool } from './../../../store/tools/tools.action';
import { Tools } from '../../../domain/tools';
import css from './layerManager.css';
import { MvuElement } from '../../MvuElement';
import expandSvg from '../../../assets/icons/expand.svg';
import clearSvg from '../../../assets/icons/x-square.svg';
import chevronSvg from './assets/chevron.svg';

const Update_Draggable_Items = 'update_draggable_items';
const Update_Collapse_Change = 'update_collapse_change';
const Update_Dragged_Item = 'update_dragged_item';
const Update_Layer_Swipe = 'update_layer_swipe';

/**
 * @typedef DraggableItem
 * @property {string} id
 * @property {Layer} layer
 * @property {number} zIndex
 * @property {number} listIndex
 * @property {boolean} isPlaceholder
 * @property {boolean} isDraggable
 * @property {boolean} collapse
 */

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
			draggedItem: false /* instead of using e.dataTransfer.get/setData() using internal State to get access for dragged object  */
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
					...model,
					draggableItems: [...data]
				};
			case Update_Collapse_Change:
				return {
					...model,
					draggableItems: model.draggableItems.map((draggableItem) => {
						if (draggableItem.id === data.layerId) {
							return { ...draggableItem, collapsed: data.collapsed };
						}
						return draggableItem;
					})
				};
			case Update_Dragged_Item:
				return { ...model, draggedItem: data };
			case Update_Layer_Swipe:
				return { ...model, isLayerSwipeActive: data.active };
		}
	}

	onInitialize() {
		this.observe(
			(store) => store.layers.active,
			(active) => this._buildDraggableItems(active.filter((l) => !l.constraints.hidden))
		);
		this.observe(
			(state) => state.layerSwipe,
			(layerSwipe) => this.signal(Update_Layer_Swipe, layerSwipe)
		);
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
			const old = this.getModel().draggableItems.filter((item) => item.id === layer.id)[0];

			draggableItems.push({
				id: layer.id,
				layer: layer,
				zIndex: layer.zIndex,
				isPlaceholder: false,
				listIndex: j + 1,
				isDraggable: true,
				collapsed: old ? old.collapsed : true
			});
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

		const isValidDropTarget = (draggedItem, dropItemCandidate) => {
			return dropItemCandidate.isPlaceholder && !isNeighbour(dropItemCandidate.listIndex, draggedItem.listIndex);
		};

		const onCollapseChanged = (e) => {
			this.signal(Update_Collapse_Change, e.detail);
		};

		const createLayerElement = (draggableItem) => {
			const layerOptions = { id: draggableItem.id };
			return html`<ba-layer-item
				.layer=${layerOptions}
				.collapsed=${draggableItem.collapsed}
				class="layer"
				draggable
				data-test-id
				@collapse=${onCollapseChanged}
			>
			</ba-layer-item>`;
		};

		const createPlaceholderElement = (draggableItem) => {
			return html`<div id=${'placeholder_' + draggableItem.listIndex} class="placeholder"></div>`;
		};

		const createIndexNumberForPlaceholder = (listIndex, draggableItem) => {
			const isHigherThenDrag = draggableItem.listIndex >= listIndex ? 1 : 0;
			return listIndex / 2 + isHigherThenDrag;
		};

		const onDragStart = (e, draggableItem) => {
			if (this._environmentService.isTouch()) {
				return;
			}

			this.signal(Update_Dragged_Item, draggableItem);

			e.target.classList.add('isdragged');
			e.dataTransfer.dropEffect = 'move';
			e.dataTransfer.effectAllowed = 'move';
			this.shadowRoot.querySelectorAll('.placeholder').forEach((p) => {
				const listIndex = Number.parseFloat(p.id.replace('placeholder_', ''));
				p.innerHTML = createIndexNumberForPlaceholder(listIndex, draggableItem);
				if (!isNeighbour(listIndex, draggableItem.listIndex)) {
					p.classList.add('placeholder-active');
				}
			});
		};

		const onDragEnd = (e) => {
			e.target.classList.remove('isdragged');
			e.preventDefault();
			this.shadowRoot.querySelectorAll('.placeholder').forEach((p) => p.classList.remove('placeholder-active'));
		};

		const onDrop = (e, draggableItem) => {
			const getNewZIndex = (oldZIndex) => (oldZIndex === this._layerCount - 1 ? oldZIndex - 1 : oldZIndex);

			if (draggableItem.isPlaceholder && draggedItem) {
				modifyLayer(draggedItem.id, { zIndex: getNewZIndex(draggableItem.zIndex) });
			}
			if (e.target.classList.contains('placeholder')) {
				e.target.classList.remove('over');
			}
			this.signal(Update_Dragged_Item, false);
		};
		const onDragOver = (e, draggableItem) => {
			e.preventDefault();
			const defaultDropEffect = 'none';

			const getDropEffectFor = (draggedItem) => {
				return isValidDropTarget(draggedItem, draggableItem) ? 'all' : defaultDropEffect;
			};

			e.dataTransfer.dropEffect = draggedItem ? getDropEffectFor(draggedItem) : defaultDropEffect;
		};

		const onDragEnter = (e, draggableItem) => {
			const doNothing = () => {};
			const addClassName = () => (isValidDropTarget(draggedItem, draggableItem) ? e.target.classList.add('over') : doNothing());
			const dragEnterAction = draggedItem ? addClassName : doNothing;
			dragEnterAction();
		};

		const onDragLeave = (e) => {
			e.stopPropagation();
			if (e.target?.classList.contains('over')) {
				e.target.classList.remove('over');
			}
		};

		const buttons = this._getButtons(model);

		return html`
			<style>
				${css}
			</style>
			<div class="layermanager overflow-container">
				<div class="title">${translate('layerManager_title')}</div>
				<ul class="layers">
					${repeat(
						draggableItems,
						(draggableItem) => draggableItem.listIndex + '_' + draggableItem.id,
						(draggableItem, index) =>
							html` <li
								draggable=${draggableItem.isDraggable}
								@dragstart=${(e) => onDragStart(e, draggableItem)}
								@dragend=${onDragEnd}
								@drop=${(e) => onDrop(e, draggableItem)}
								@dragover=${(e) => onDragOver(e, draggableItem)}
								@dragenter=${(e) => onDragEnter(e, draggableItem)}
								@dragleave=${onDragLeave}
								index=${index}
								class="draggable"
							>
								${draggableItem.isPlaceholder ? createPlaceholderElement(draggableItem) : createLayerElement(draggableItem)}
							</li>`
					)}
				</ul>
				${buttons}
			</div>
		`;
	}

	_getButtons(model) {
		const translate = (key) => this._translationService.translate(key);
		const { draggableItems, isLayerSwipeActive } = model;
		const expandAll = () => {
			this.signal(
				Update_Draggable_Items,
				draggableItems.map((i) => (i.isPlaceholder ? i : { ...i, collapsed: false }))
			);
		};

		const collapseAll = () => {
			this.signal(
				Update_Draggable_Items,
				draggableItems.map((i) => (i.isPlaceholder ? i : { ...i, collapsed: true }))
			);
		};

		const removeAll = () => {
			draggableItems
				.filter((i) => !i.isPlaceholder)
				.forEach((i, index) => {
					if (index > 0) {
						removeLayer(i.id);
					}
				});
		};

		const getShareCompareChip = () => {
			return isLayerSwipeActive
				? html` <div class="chips__container">
						<ba-share-chip .label=${translate('layerManager_compare_share')}></ba-share-chip>
					</div>`
				: nothing;
		};

		const draggableItemsExpandable = draggableItems.some((draggableItem) => draggableItem.collapsed);
		const expandOrCollapseLabel = draggableItemsExpandable ? translate('layerManager_expand_all') : translate('layerManager_collapse_all');
		const expandOrCollapseTitle = draggableItemsExpandable
			? translate('layerManager_expand_all_title')
			: translate('layerManager_collapse_all_title');
		const expandOrCollapseAction = draggableItemsExpandable ? expandAll : collapseAll;

		return draggableItems.filter((draggableItem) => !draggableItem.isPlaceholder).length > 0
			? html`<div class="layermanager__actions">
						<ba-button
							id="button_expand_or_collapse"
							class="layermanager__expandOrCollapse"
							.label=${expandOrCollapseLabel}
							.title=${expandOrCollapseTitle}
							.type=${'secondary'}
							.icon=${chevronSvg}
							@click=${expandOrCollapseAction}
							style="border-right: 1px dotted var(--header-background-color);"
						></ba-button>
						<ba-button
							id="button_remove_all"
							.label=${translate('layerManager_remove_all')}
							.title=${translate('layerManager_remove_all_title')}
							.type=${'secondary'}
							.icon=${clearSvg}
							@click=${removeAll}
						></ba-button>
						<ba-button
							id="button_layer_swipe"
							.label=${translate(isLayerSwipeActive ? 'layerManager_compare_stop' : 'layerManager_compare')}
							.title=${translate(isLayerSwipeActive ? 'layerManager_compare_stop_title' : 'layerManager_compare_title')}
							.type=${'secondary'}
							.icon=${expandSvg}
							@click=${() => toggleCurrentTool(Tools.COMPARE)}
						></ba-button>
					</div>
					${getShareCompareChip()} `
			: nothing;
	}

	static get tag() {
		return 'ba-layer-manager';
	}
}
