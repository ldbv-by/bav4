/**
 * @module modules/admin/components/Catalog
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import css from './catalog.css';
import { createUniqueId } from '../../../utils/numberUtils';
import { deepClone } from '../../../utils/clone';
import { $injector } from '../../../injection';

const Update_Catalog_Tree = 'update_catalog_tree';
const Update_Geo_Resources = 'update_geo_resources';
const Update_Geo_Resource_Filter = 'update_geo_resource_filter';
const Update_Topics = 'update_topics';
const Update_Drag_Context = 'update_drag_context';
const Update_Popup_Type = 'update_popup_type';
/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class Catalog extends MvuElement {
	#nodeWasPersisted;
	#isTreeDirty;
	#editContext;
	#cachedTopic;

	constructor() {
		super({
			topics: [],
			catalogTree: [],
			geoResources: [],
			geoResourceFilter: '',
			dragContext: null,
			popupType: null
		});

		const { AdminCatalogService: adminCatalogService, TranslationService: translationService } = $injector.inject(
			'AdminCatalogService',
			'TranslationService'
		);

		this._adminCatalogService = adminCatalogService;
		this._translationService = translationService;
		this.#nodeWasPersisted = false;
		this.#isTreeDirty = false;
		this.#editContext = null;
		this.#cachedTopic = null;
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._requestData();
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Catalog_Tree:
				return { ...model, catalogTree: [...data] };
			case Update_Drag_Context:
				return { ...model, dragContext: data ? { ...data } : null };
			case Update_Geo_Resources:
				return { ...model, geoResources: [...data] };
			case Update_Topics:
				return { ...model, topics: [...data] };
			case Update_Geo_Resource_Filter:
				return { ...model, geoResourceFilter: data };
			case Update_Popup_Type:
				return { ...model, popupType: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { topics, geoResources, catalogTree, geoResourceFilter, popupType } = model;
		const geoResourceFilterUC = geoResourceFilter ? geoResourceFilter.toUpperCase() : null;
		const translate = (key) => this._translationService.translate(key);

		const onTopicSelected = (evt) => {
			const value = evt.currentTarget.value;

			if (this.#isTreeDirty) {
				this.#cachedTopic = value;
				this.signal(Update_Popup_Type, 'disposeChange');
				return;
			}

			this._requestCatalogTree(value);
		};

		const onChangeToCachedTopic = () => {
			this._requestCatalogTree(this.#cachedTopic);
			this._closePopup();
			this.#cachedTopic = null;
			this.#isTreeDirty = null;
		};

		const onGeoResourceDragStart = (evt, geoResource) => {
			evt.stopPropagation();
			this.signal(Update_Drag_Context, { label: geoResource.label, geoResourceId: geoResource.id });
		};

		const onNodeDragStart = (evt, node) => {
			evt.stopPropagation();
			this.signal(Update_Drag_Context, { ...node });
			this.#nodeWasPersisted = false;
		};

		const onNodeDragEnd = (node) => {
			const tree = deepClone(this.catalogTree);

			// Restore Node in tree when it was not rearranged.
			if (!this.#nodeWasPersisted) {
				this._updateNode(tree, { ...node, hidden: false });
			}

			// Ensure preview cleanup.
			this._removeNodeById(tree, 'preview');
			this.signal(Update_Catalog_Tree, tree);
			this.signal(Update_Drag_Context, null);
		};

		const onNodeDragOver = (evt, node) => {
			evt.preventDefault();
			evt.stopPropagation();

			if (node?.nodeId === 'preview') return;

			const tree = deepClone(this.catalogTree);
			const previewNode = {
				label: this.dragContext.label,
				geoResourceId: this.dragContext.geoResourceId,
				nodeId: 'preview'
			};

			// Hide Node from UI while it's dragged (dragstart is too early to do this).
			if (this.dragContext.nodeId !== undefined) {
				if (this.dragContext.hidden !== true) {
					this._updateNode(tree, { ...this.dragContext, hidden: true });
					this.signal(Update_Drag_Context, { ...this.dragContext, hidden: true });
				}
			}

			// Find pointer position within the current dropzone target (evt.currentTarget) to determine where to drop the dragContext.
			const rect = evt.currentTarget.querySelector('.catalog-node').getBoundingClientRect();
			const insertionValue = this._getNormalizedClientYPositionInRect(evt.clientY, rect);

			this._removeNodeById(tree, 'preview');

			if (!node) {
				// Handles edge case, when a node is dragged at the start or end of the tree.
				// In that case the dragged node should get appended or prepended.
				const rect = evt.currentTarget.getBoundingClientRect();
				const heightDifference = this._getClientYHeightDiffInRect(evt.clientY, rect);
				const computedStyle = window.getComputedStyle(evt.currentTarget);
				const paddingTop = parseFloat(computedStyle.paddingTop);
				const paddingBottom = parseFloat(computedStyle.paddingBottom);

				if (heightDifference >= rect.height - paddingTop) {
					tree.unshift(this._prepareNode(previewNode));
				} else if (heightDifference <= paddingBottom) {
					tree.push(this._prepareNode(previewNode));
				}
				this.signal(Update_Catalog_Tree, tree);
				return;
			}

			if (node.children !== undefined) {
				if (insertionValue < 0.25) {
					this._addNodeAt(tree, node.nodeId, previewNode, true);
				} else {
					this._prependNodeAsChild(tree, node.nodeId, previewNode);
				}
			} else {
				this._addNodeAt(tree, node.nodeId, previewNode, insertionValue < 0.5);
			}

			this.signal(Update_Catalog_Tree, tree);
		};

		const onNodeDrop = (evt) => {
			const tree = deepClone(this.catalogTree);
			const previewNode = this._getNodeById(tree, 'preview');

			if (previewNode) {
				this._removeNodeById(tree, this.dragContext.nodeId);
				this._replaceNode(tree, 'preview', { ...this.dragContext, hidden: false });
				this.signal(Update_Catalog_Tree, tree);
				this.#isTreeDirty = true;
				this.#nodeWasPersisted = true;
			}

			evt.preventDefault();
		};

		const onTreeDragZoneLeave = (evt) => {
			/* onTreeDragZoneLeave gets also called when the mouse enters a children of the tree. Therefore it is hard to determine if
			 * the zone has been left. Therefore checking if the pointer is outside the drag zone's bounding box fixes the issue.
			 */
			const rect = evt.currentTarget.getBoundingClientRect();
			const clientXNormalizedPositionInRect = this._getNormalizedClientXPositionInRect(evt.clientX, rect);
			const clientYNormalizedPositionInRect = this._getNormalizedClientYPositionInRect(evt.clientY, rect);

			const isOutsideOfDragZone =
				clientXNormalizedPositionInRect < 0 ||
				clientXNormalizedPositionInRect > 1 ||
				clientYNormalizedPositionInRect < 0 ||
				clientYNormalizedPositionInRect > 1;

			if (isOutsideOfDragZone) {
				const tree = deepClone(this.catalogTree);
				this._removeNodeById(tree, 'preview');
				this.signal(Update_Catalog_Tree, tree);
			}
		};

		const onAddNewGroupNode = (node) => {
			const tree = deepClone(this.catalogTree);
			const newGroupNode = this._prepareNode({ label: 'New Group', children: [] });
			this._updateNode(tree, { ...node, children: [newGroupNode, ...node.children], foldout: true });
			this.signal(Update_Catalog_Tree, tree);
		};

		const onFoldoutNodeGroup = (node) => {
			const tree = deepClone(this.catalogTree);
			this._updateNode(tree, { ...node, foldout: !node.foldout });
			this.signal(Update_Catalog_Tree, tree);
		};

		const onDeleteNodeClicked = (node) => {
			const tree = deepClone(this.catalogTree);
			this._removeNodeById(tree, node.nodeId);
			this.signal(Update_Catalog_Tree, tree);
		};

		const onOpenEditGroupLabelPopup = (node) => {
			this.#editContext = node;
			this.signal(Update_Popup_Type, 'editGroupLabel');
			//@ts-ignore
			this.shadowRoot.querySelector('input.popup-input').value = node.label;
		};

		const onEditGroupLabel = () => {
			const tree = deepClone(this.catalogTree);
			//@ts-ignore
			const newLabel = this.shadowRoot.querySelector('input.popup-input').value;
			if (this.#editContext.label !== newLabel) {
				this.#isTreeDirty = true;
			}

			this._updateNode(tree, { ...this.#editContext, label: newLabel });
			this.signal(Update_Catalog_Tree, tree);
			this._closePopup();
		};

		const onGeoResourceFilterInput = (evt) => {
			this.signal(Update_Geo_Resource_Filter, evt.currentTarget.value);
		};

		const onGeoResourceRefreshClicked = () => {
			//@ts-ignore
			this.shadowRoot.querySelector('#geo-resource-search-input').value = '';
			this.signal(Update_Geo_Resource_Filter, '');
			this._requestGeoResources();
		};

		const getCatalogTreeHtml = () => {
			const getNodeHtml = (node) => {
				if (node.hidden) {
					return nothing;
				}

				return html`
					<li
						draggable="true"
						class="draggable"
						node-id=${node.nodeId}
						@dragstart=${(evt) => onNodeDragStart(evt, node)}
						@dragend=${() => onNodeDragEnd(node)}
						@dragover=${(evt) => onNodeDragOver(evt, node)}
					>
						${node.children !== undefined
							? html` <div class="catalog-node group">
										<div class="title-bar">
											<button class="btn-foldout" @click=${() => onFoldoutNodeGroup(node)}>
												<i class="chevron-down ${node.foldout ? 'collapsed' : ''}"></i>
											</button>
											<span class="node-label">${node.label}</span>
										</div>
										<div class="btn-bar" style="flex: 0.1333; justify-items:right;">
											<button class="btn-add-group-node" @click=${() => onAddNewGroupNode(node)}>New</button>
											<button class="btn-edit-group-node" @click=${() => onOpenEditGroupLabelPopup(node)}>Edit</button>
											<button class="btn-delete-node" @click=${() => onDeleteNodeClicked(node)}>X</button>
										</div>
									</div>
									${node.foldout
										? html`<ul>
												${repeat(
													node.children,
													() => node.nodeId,
													(childNode) => getNodeHtml(childNode)
												)}
											</ul> `
										: nothing}`
							: html`
									<div class="catalog-node geo-resource">
										<div class="title-bar">
											<div class="drag-icon-container">
												<i class="arrow-left-right"></i>
											</div>
											<span class="node-label">${node.label}</span>
										</div>
										<div class="btn-bar" style="flex: 0.05; justify-items:right;">
											<button class="btn-delete-node" @click=${() => onDeleteNodeClicked(node)}>X</button>
										</div>
									</div>
								`}
					</li>
				`;
			};

			return html`
				<div id="catalog-tree" @dragleave=${onTreeDragZoneLeave} @drop=${onNodeDrop} @dragover=${(evt) => onNodeDragOver(evt, null)}>
					<ul id="catalog-tree-root">
						${repeat(
							catalogTree,
							(node) => node.nodeId,
							(node) => getNodeHtml(node)
						)}
					</ul>
				</div>
			`;
		};

		const getEditGroupLabelPopup = () => {
			return html`
				<div class="popup">
					<div id="text-label-edit" class="popup-container">
						<div class="popup-edit">
							<span class="popup-title">${translate('admin_popup_edit_label_title')}</span>
							<input draggable="false" class="popup-input" type="text" value=${this.#editContext.label} />
						</div>
						<div class="popup-confirm">
							<button class="btn-cancel" @click=${() => this._closePopup()}>${translate('admin_button_cancel')}</button>
							<button class="btn-confirm" @click=${() => onEditGroupLabel()}>${translate('admin_button_confirm')}</button>
						</div>
					</div>
				</div>
			`;
		};

		const getConfirmTreeDisposePopup = () => {
			return html`
				<div id="confirm-dispose-popup" class="popup">
					<div class="popup-container">
						<div class="popup-edit">
							<span class="popup-title">${translate('admin_popup_tree_dispose_title')}</span>
						</div>
						<div class="popup-confirm">
							<button class="btn-cancel" @click=${() => this._closePopup()}>${translate('admin_button_cancel')}</button>
							<button class="btn-confirm" @click=${onChangeToCachedTopic}>${translate('admin_button_confirm')}</button>
						</div>
					</div>
				</div>
			`;
		};

		const getPopup = () => {
			switch (popupType) {
				case 'editGroupLabel':
					return getEditGroupLabelPopup();
				case 'disposeChange':
					return getConfirmTreeDisposePopup();
				default:
					return nothing;
			}
		};

		return html`
			<style>
				${css}
			</style>
			<div class="grid-container">
				<div id="catalog-editor">
					<div class="menu-bar space-between">
						<div class="catalog-select-container">
							<select id="topic-select" @change=${onTopicSelected}>
								${topics.map((t) => {
									return html`<option value=${t.id}>${t.label}</option>`;
								})}
							</select>
						</div>
						<div class="catalog-button-bar">
							<button>${translate('admin_georesource_save_draft')}</button>
							<button>${translate('admin_georesource_publish')}</button>
						</div>
					</div>
					<div class="catalog-container">${getCatalogTreeHtml()}</div>
				</div>
				<div id="geo-resource-explorer" class="gr25">
					<div class="menu-bar">
						<div class="geo-resource-button-bar">
							<input
								id="geo-resource-search-input"
								type="text"
								placeholder="Geo Resource filtern"
								autocomplete="off"
								@input=${onGeoResourceFilterInput}
							/>
							<button id="btn-geo-resource-refresh" @click=${onGeoResourceRefreshClicked}>${translate('admin_georesource_refresh')}</button>
						</div>
					</div>
					<div id="geo-resource-explorer-content">
						${geoResources.map((r) => {
							if (!geoResourceFilter || r.label.toUpperCase().indexOf(geoResourceFilterUC) > -1) {
								return html`<div draggable="true" class="geo-resource draggable" @dragstart=${(evt) => onGeoResourceDragStart(evt, r)}>
									<div class="title-bar">
										<div class="drag-icon-container">
											<i class="arrow-left-right"></i>
										</div>
										<span class="label">${r.label}</span>
									</div>
								</div>`;
							}
							return nothing;
						})}
					</div>
				</div>
			</div>

			${getPopup()}
		`;
	}

	_prepareTree(tree) {
		for (let i = 0; i < tree.length; i++) {
			tree[i] = this._prepareNode(tree[i]);
		}

		return tree;
	}

	_prepareNode = (node) => {
		if (node.nodeId === undefined) {
			node.nodeId = createUniqueId();
		}

		if (node.hidden === undefined) {
			node.hidden = false;
		}

		if (node.geoResourceId !== undefined) {
			const geoResource = this._adminCatalogService.getCachedGeoResourceById(node.geoResourceId);
			node = { ...node, label: geoResource.label };
		}

		if (node.children !== undefined) {
			if (node.foldout === undefined) {
				node.foldout = true;
			}

			for (let i = 0; i < node.children.length; i++) {
				node.children[i] = this._prepareNode(node.children[i]);
			}
		}

		return node;
	};

	_traverseTree(tree, nodeCallback) {
		const traverse = (currentTree, parentNode, callback) => {
			for (let i = 0; i < currentTree.length; i++) {
				// children is undefined on root tree level.
				if (callback(i, currentTree, parentNode) === true) {
					return;
				}

				const currentNode = currentTree[i];
				if (currentNode.children !== undefined) {
					traverse(currentNode.children, currentNode, callback);
				}
			}
		};

		traverse(tree, null, nodeCallback);
	}

	_removeNodeById(tree, nodeId) {
		this._traverseTree(tree, (index, subTree) => {
			const currentNode = subTree[index];
			if (currentNode.nodeId === nodeId) {
				subTree.splice(index, 1);
				return true;
			}

			return false;
		});
	}

	_replaceNode(tree, nodeIdToReplace, newNode) {
		this._traverseTree(tree, (index, subTree) => {
			const currentNode = subTree[index];
			if (currentNode.nodeId === nodeIdToReplace) {
				subTree[index] = this._prepareNode({ ...newNode });
				return true;
			}

			return false;
		});
	}

	_updateNode(tree, node) {
		this._traverseTree(tree, (index, subTree) => {
			const currentNode = subTree[index];
			if (currentNode.nodeId === node.nodeId) {
				subTree[index] = { ...node };
				return true;
			}

			return false;
		});
	}

	_getParentNode(tree, childNode) {
		let parentNode = null;

		this._traverseTree(tree, (index, subTree, currentParentNode) => {
			const currentNode = subTree[index];
			if (currentNode.nodeId === childNode.nodeId) {
				parentNode = currentParentNode;
				return true;
			}

			return false;
		});

		return parentNode;
	}

	_getNodeById(tree, nodeId) {
		let resultNode = null;

		this._traverseTree(tree, (index, subTree) => {
			const currentNode = subTree[index];
			if (currentNode.nodeId === nodeId) {
				resultNode = { ...currentNode };
				return true;
			}

			return false;
		});

		return resultNode;
	}

	_prependNodeAsChild(tree, parentNodeId, newNode) {
		let subTree = tree;
		let subTreeIndex = -1;

		this._traverseTree(tree, (index, currentTraversedTree) => {
			const currentNode = currentTraversedTree[index];
			if (currentNode.nodeId === parentNodeId) {
				subTree = currentTraversedTree;
				subTreeIndex = index;
				return true;
			}
			return false;
		});

		const preparedNewNode = this._prepareNode(newNode);
		subTree[subTreeIndex].children.unshift(preparedNewNode);
	}

	_addNodeAt(tree, nodeId, newNode, insertBefore = false) {
		let subTree = tree;
		let subTreeIndex = -1;

		this._traverseTree(tree, (index, currentTraversedTree) => {
			const currentNode = currentTraversedTree[index];
			if (currentNode.nodeId === nodeId) {
				subTree = currentTraversedTree;
				subTreeIndex = index;
				return true;
			}
			return false;
		});

		const preparedNewNode = this._prepareNode(newNode);
		if (insertBefore) {
			if (subTreeIndex === 0) {
				subTree.unshift(preparedNewNode);
			} else {
				subTree.splice(subTreeIndex, 0, preparedNewNode);
			}
		} else {
			subTree.splice(subTreeIndex + 1, 0, preparedNewNode);
		}
	}

	_closePopup() {
		this.signal(Update_Popup_Type, null);
	}

	_getClientYHeightDiffInRect(clientY, rect) {
		return rect.height - (clientY - rect.top);
	}

	_getNormalizedClientXPositionInRect(clientX, rect) {
		const normalizedCursorPositionInElement = (clientX - rect.left) / rect.width;
		return normalizedCursorPositionInElement;
	}

	_getNormalizedClientYPositionInRect(clientY, rect) {
		const normalizedCursorPositionInElement = (clientY - rect.top) / rect.height;
		return normalizedCursorPositionInElement;
	}

	async _requestData() {
		await this._requestTopics();
		await this._requestGeoResources();

		const topics = this.getModel().topics;
		await this._requestCatalogTree(topics[0].id);
	}

	async _requestCatalogTree(topic) {
		const tree = await this._adminCatalogService.getCatalog(topic);
		this.signal(Update_Catalog_Tree, this._prepareTree(deepClone(tree)));
	}

	async _requestTopics() {
		const topics = await this._adminCatalogService.getTopics();
		this.signal(Update_Topics, topics);
	}

	async _requestGeoResources() {
		const resources = await this._adminCatalogService.getGeoResources();
		resources.sort((a, b) => {
			return a.label.localeCompare(b.label);
		});

		this.signal(Update_Geo_Resources, resources);
	}

	get catalogTree() {
		return this.getModel().catalogTree;
	}

	get dragContext() {
		return this.getModel().dragContext;
	}

	get isDirty() {
		return this.#isTreeDirty;
	}

	static get tag() {
		return 'ba-catalog';
	}
}
