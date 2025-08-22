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
const Update_Drag_Context = 'update_drag_context';

/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class Catalog extends MvuElement {
	#nodeDragOverResult;

	constructor() {
		super({
			catalogTree: [],
			dragContext: null
		});

		const { AdminCatalogService: adminCatalogService } = $injector.inject('AdminCatalogService');
		this._adminCatalogService = adminCatalogService;

		this.#nodeDragOverResult = { nodeId: undefined, addNodeBefore: undefined };
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._requestCatalogTree('ba');
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Catalog_Tree:
				return { ...model, catalogTree: [...data] };
			case Update_Drag_Context:
				return { ...model, dragContext: { ...data } };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const onNodeDragStart = (evt, node) => {
			evt.stopPropagation();

			evt.dataTransfer.dropEffect = 'move';
			evt.dataTransfer.effectAllowed = 'move';
			this.dragContext = { ...node };
		};

		const onNodeDragOver = (evt, node) => {
			evt.preventDefault();
			evt.stopPropagation();

			if (node.nodeId === 'preview') return;
			if (!this.dragContext) return;

			if (this.dragContext.nodeId !== undefined) {
				this._updateNode({ ...this.dragContext, hidden: true });
			}

			const catalogTree = deepClone(this.catalogTree);

			// Find pointer position within the current dropzone target (node) to determine where to drop the dragContext.
			const rect = evt.currentTarget.getBoundingClientRect();
			const relativeCursorPositionInElement = evt.clientY - rect.top;
			const normalizedCursorPositionInElement = relativeCursorPositionInElement / rect.height;
			const insertBefore = normalizedCursorPositionInElement < 0.5;

			this._removeNodeById(catalogTree, 'preview');
			this._addNodeAt(catalogTree, node.nodeId, { label: 'Preview Node', nodeId: 'preview' }, insertBefore);
			this.signal(Update_Catalog_Tree, catalogTree);
		};

		const onNodeDrop = () => {
			const catalogTree = deepClone(this.catalogTree);
			this._replaceNode(catalogTree, 'preview', this.dragContext);
			this.signal(Update_Catalog_Tree, catalogTree);
		};

		const onTreeDragLeave = (evt) => {
			if (evt.currentTarget === evt.target) {
				const catalogTree = deepClone(this.catalogTree);
				this._removeNodeById(catalogTree, 'preview');
				this.signal(Update_Catalog_Tree, catalogTree);
			}
		};

		const { catalogTree } = model;

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
						@dragover=${(evt) => onNodeDragOver(evt, node)}
					>
						${node.children !== undefined
							? html` <div class="catalog-node group">
										<div class="title-bar"><span class="node-label">${node.label}</span></div>
										<div class="btn-bar">
											<button>New</button>
											<button>Dup</button>
											<button>X</button>
										</div>
									</div>
									<ul>
										${repeat(
											node.children,
											() => node.nodeId,
											(childNode) => getNodeHtml(childNode)
										)}
									</ul>`
							: html` <div class="catalog-node geo-resource"><span class="node-label">${node.label}</span></div> `}
					</li>
				`;
			};

			return html`
				<div id="catalog-tree" @drop=${onNodeDrop} @dragleave=${onTreeDragLeave}>
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

		return html`
			<style>
				${css}
			</style>

			<div id="catalog-editor" class="gr50">
				<div class="menu-bar space-between gr100">
					<div class="catalog-select-container">
						<select>
							<option>Catalog A</option>
							<option>Catalog B</option>
							<option>Catalog C</option>
						</select>
					</div>
					<div class="catalog-button-bar">
						<button>Entwurf speichern</button>
						<button>Veröffentlichen</button>
					</div>
				</div>
				<div class="catalog-container">${getCatalogTreeHtml()}</div>
			</div>
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

		if (node.geoResourceId !== undefined) {
			const geoResource = this._adminCatalogService.getCachedGeoResourceById(node.geoResourceId);
			if (geoResource !== null) {
				node = { ...node, label: geoResource.label };
			}
		}

		if (node.children !== undefined) {
			if (node.foldout === undefined) {
				node.foldout = false;
			}

			for (let i = 0; i < node.children.length; i++) {
				node.children[i] = this._prepareNode(node.children[i]);
			}
		}

		return node;
	};

	_traverseTree(tree, nodeCallback) {
		const traverse = (currentTree, callback) => {
			for (let i = 0; i < currentTree.length; i++) {
				const currentNode = currentTree[i];
				if (callback(currentNode, i, currentTree) === true) {
					return;
				}

				if (currentNode.children !== undefined) {
					traverse(currentNode.children, callback);
				}
			}
		};

		traverse(tree, nodeCallback);
	}

	_removeNodeById(tree, nodeId) {
		this._traverseTree(tree, (currentNode, index, subTree) => {
			if (currentNode.nodeId === nodeId) {
				subTree.splice(index, 1);
				return true;
			}

			return false;
		});
	}

	_replaceNode(tree, nodeIdToReplace, newNode) {
		this._traverseTree(tree, (currentNode, index, subTree) => {
			if (currentNode.nodeId === nodeIdToReplace) {
				subTree[index] = this._prepareNode({ ...newNode });
				return true;
			}

			return false;
		});
	}

	_updateNode(tree, node) {
		this._traverseTree(tree, (currentNode, index, subTree) => {
			if (currentNode.nodeId === node.nodeId) {
				subTree[index] = { ...node };
				return true;
			}

			return false;
		});
	}

	_addNodeAt(tree, nodeId, newNode, insertBefore = false) {
		let subTree = tree;
		let subTreeIndex = -1;

		this._traverseTree(tree, (currentNode, index, currentTraversedTree) => {
			if (currentNode.nodeId === nodeId) {
				subTree = currentTraversedTree;
				subTreeIndex = index;
				return true;
			}
			return false;
		});

		if (insertBefore) {
			if (subTreeIndex === 0) {
				subTree.unshift(newNode);
			} else {
				subTree.splice(subTreeIndex, 0, newNode);
			}
		} else {
			subTree.splice(subTreeIndex + 1, 0, newNode);
		}
	}

	async _requestCatalogTree(topic) {
		this.catalogTree = await this._adminCatalogService.getCatalog(topic);
	}

	set catalogTree(value) {
		this.signal(Update_Catalog_Tree, this._prepareTree(deepClone(value)));
	}

	get catalogTree() {
		return this.getModel().catalogTree;
	}

	get dragContext() {
		return this.getModel().dragContext;
	}

	set dragContext(value) {
		this.signal(Update_Drag_Context, value);
	}

	static get tag() {
		return 'ba-catalog';
	}
}
