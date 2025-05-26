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

const Update_Stack_Items = 'update_stack_items';
const Update_Collapse_Change = 'update_collapse_change';
const Update_Dragged_Item = 'update_dragged_item';
const Update_Layer_Swipe = 'update_layer_swipe';

/**
 * An Object with an id and zIndex property, representing a layer.
 *
 * @typedef LayerLike
 * @property {string} id
 * @property {number} zIndex
 */

/**
 * An element representing a ui-element in a stack like container,
 * to enable user interaction like drag&drop or collapse/expand
 *
 * @typedef StackItem
 * @property {LayerLike| Layer} layer
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
	#translationService;
	#environmentService;

	constructor() {
		super({
			stackItems: [],
			draggedItem: false /* instead of using e.dataTransfer.get/setData() using internal State to get access for dragged object  */
		});
		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');
		this.#translationService = TranslationService;
		this.#environmentService = EnvironmentService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Stack_Items:
				return {
					...model,
					stackItems: [...data]
				};
			case Update_Collapse_Change:
				return {
					...model,
					stackItems: model.stackItems.map((stackItem) => {
						if (stackItem.layer.id === data.layerId) {
							return { ...stackItem, collapsed: data.collapsed };
						}
						return stackItem;
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
			(active) => this._createStackItems(active.filter((l) => !l.constraints.hidden))
		);
		this.observe(
			(state) => state.layerSwipe,
			(layerSwipe) => this.signal(Update_Layer_Swipe, layerSwipe)
		);
	}

	/**
	 * @private
	 */
	_createStackItems(layers) {
		const createPlaceholder = (zIndex, listIndex) => {
			return { layer: { id: null, zIndex: zIndex }, isPlaceholder: true, listIndex: listIndex, isDraggable: false };
		};
		const stackItems = [createPlaceholder(0, 0)];
		this._layerCount = layers.length;
		this.signal(Update_Dragged_Item, false);

		let j = 0;
		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const old = this.getModel().stackItems.filter((item) => item.layer.id === layer.id)[0];

			stackItems.push({
				layer: layer,
				isPlaceholder: false,
				listIndex: j + 1,
				isDraggable: true,
				collapsed: old ? old.collapsed : true
			});
			stackItems.push(createPlaceholder(layer.zIndex + 1, j + 2));
			j += 2;
		}
		this.signal(Update_Stack_Items, stackItems);
	}

	/**
	 * @override
	 */
	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { stackItems, draggedItem } = model;
		const isNeighbour = (index, otherIndex) => {
			return index === otherIndex || index - 1 === otherIndex || index + 1 === otherIndex;
		};

		const isValidDropTarget = (draggedItem, dropItemCandidate) => {
			return dropItemCandidate.isPlaceholder && !isNeighbour(dropItemCandidate.listIndex, draggedItem.listIndex);
		};

		const onCollapseChanged = (e) => {
			this.signal(Update_Collapse_Change, e.detail);
		};

		const createLayerElement = (stackItem) => {
			return html`<ba-layer-item
				.layerId=${stackItem.layer.id}
				.collapsed=${stackItem.collapsed}
				class="layer"
				draggable
				data-test-id
				@collapse=${onCollapseChanged}
			>
			</ba-layer-item>`;
		};

		const createPlaceholderElement = (stackItem) => {
			return html`<div id=${'placeholder_' + stackItem.listIndex} class="placeholder"></div>`;
		};

		const createIndexNumberForPlaceholder = (listIndex, stackItem) => {
			const isHigherThenDrag = stackItem.listIndex >= listIndex ? 1 : 0;
			return listIndex / 2 + isHigherThenDrag;
		};

		const onDragStart = (e, stackItem) => {
			if (this.#environmentService.isTouch()) {
				return;
			}

			this.signal(Update_Dragged_Item, stackItem);

			e.target.classList.add('isdragged');
			e.dataTransfer.dropEffect = 'move';
			e.dataTransfer.effectAllowed = 'move';
			this.shadowRoot.querySelectorAll('.placeholder').forEach((p) => {
				const listIndex = Number.parseFloat(p.id.replace('placeholder_', ''));
				p.innerHTML = createIndexNumberForPlaceholder(listIndex, stackItem);
				if (!isNeighbour(listIndex, stackItem.listIndex)) {
					p.classList.add('placeholder-active');
				}
			});
		};

		const onDragEnd = (e) => {
			e.target.classList.remove('isdragged');
			e.preventDefault();
			this.shadowRoot.querySelectorAll('.placeholder').forEach((p) => p.classList.remove('placeholder-active'));
		};

		const onDrop = (e, stackItem) => {
			const getNewZIndex = (oldZIndex) => (oldZIndex === this._layerCount - 1 ? oldZIndex - 1 : oldZIndex);

			if (stackItem.isPlaceholder && draggedItem) {
				modifyLayer(draggedItem.layer.id, { zIndex: getNewZIndex(stackItem.layer.zIndex) });
			}
			if (e.target.classList.contains('placeholder')) {
				e.target.classList.remove('over');
			}
			this.signal(Update_Dragged_Item, false);
		};
		const onDragOver = (e, stackItem) => {
			e.preventDefault();
			const defaultDropEffect = 'none';

			const getDropEffectFor = (draggedItem) => {
				return isValidDropTarget(draggedItem, stackItem) ? 'all' : defaultDropEffect;
			};

			e.dataTransfer.dropEffect = draggedItem ? getDropEffectFor(draggedItem) : defaultDropEffect;
		};

		const onDragEnter = (e, stackItem) => {
			const doNothing = () => {};
			const addClassName = () => (isValidDropTarget(draggedItem, stackItem) ? e.target.classList.add('over') : doNothing());
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
						stackItems,
						(stackItem) => stackItem.listIndex + '_' + stackItem.layer.id,
						(stackItem, index) =>
							html` <li
								draggable=${stackItem.isDraggable}
								@dragstart=${(e) => onDragStart(e, stackItem)}
								@dragend=${onDragEnd}
								@drop=${(e) => onDrop(e, stackItem)}
								@dragover=${(e) => onDragOver(e, stackItem)}
								@dragenter=${(e) => onDragEnter(e, stackItem)}
								@dragleave=${onDragLeave}
								index=${index}
								class="draggable"
							>
								${stackItem.isPlaceholder ? createPlaceholderElement(stackItem) : createLayerElement(stackItem)}
							</li>`
					)}
				</ul>
				${buttons}
			</div>
		`;
	}

	_getButtons(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { stackItems, isLayerSwipeActive } = model;
		const expandAll = () => {
			this.signal(
				Update_Stack_Items,
				stackItems.map((i) => (i.isPlaceholder ? i : { ...i, collapsed: false }))
			);
		};

		const collapseAll = () => {
			this.signal(
				Update_Stack_Items,
				stackItems.map((i) => (i.isPlaceholder ? i : { ...i, collapsed: true }))
			);
		};

		const removeAll = () => {
			stackItems
				.filter((stackItem) => !stackItem.isPlaceholder)
				.forEach((stackItem, index) => {
					if (index > 0) {
						removeLayer(stackItem.layer.id);
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

		const stackItemsExpandable = stackItems.some((stackItem) => stackItem.collapsed);
		const expandOrCollapseLabel = stackItemsExpandable ? translate('layerManager_expand_all') : translate('layerManager_collapse_all');
		const expandOrCollapseTitle = stackItemsExpandable ? translate('layerManager_expand_all_title') : translate('layerManager_collapse_all_title');
		const expandOrCollapseAction = stackItemsExpandable ? expandAll : collapseAll;

		return stackItems.filter((stackItem) => !stackItem.isPlaceholder).length > 0
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
