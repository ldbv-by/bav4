/**
 * @module modules/admin/components/Catalog
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import css from './catalog.css';
import { createUniqueId } from '../../../utils/numberUtils';

const Update_Catalog_Tree = 'update_catalog_tree';
const Update_Drag_Context = 'update_drag_context';

/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class Catalog extends MvuElement {
	#dragAndDropPadding = { x: 5, y: 10 };

	constructor() {
		super({
			catalogTree: [],
			dragContext: null
		});
	}

	/**
	 * @override
	 */
	onInitialize() {}

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
		const onDragStart = (evt, node) => {
			evt.stopPropagation();

			evt.dataTransfer.dropEffect = 'move';
			evt.dataTransfer.effectAllowed = 'move';
			this.dragContext = { ...node };
		};

		const onDragEnter = (evt, dragZoneNodeId) => {
			if (dragZoneNodeId === 'preview') return;
			if (!this.dragContext) return;

			evt.preventDefault();
			evt.stopPropagation();

			if (this.dragContext.nodeId !== undefined) {
				this._updateNode({ ...this.dragContext, hidden: true });
			}

			// Find pointer position within the current dropzone target to determine where to drop the dragContext.
			const rect = evt.currentTarget.getBoundingClientRect();
			//	const x = evt.clientX - rect.left;
			const y = evt.clientY - rect.top;

			// Drop above node target (dragZone)
			if (y < this.#dragAndDropPadding.y) {
				this._removeNodeById('preview');
				this._addNodeAt(dragZoneNodeId, { label: 'Preview Node', nodeId: 'preview' }, true);

				// Nested arrays are not tracked by signal, therefore render is called manually.
				this.render();
			}
			// Drop below node target (dragZone)
			else if (y > rect.height - this.#dragAndDropPadding.y) {
				this._removeNodeById('preview');
				this._addNodeAt(dragZoneNodeId, { label: 'Preview Node', nodeId: 'preview' });
				this.render();
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
						@dragstart=${(evt) => onDragStart(evt, node)}
						@dragover=${(evt) => onDragEnter(evt, node.nodeId)}
					>
						${node.children !== undefined
							? html` <div class="catalog-node group">
										<div class="title-bar"><span class="node-label">${node.label}</span>: ${node.nodeId}</div>
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
							: html` <div class="catalog-node geo-resource"><span class="node-label">${node.label}</span>: ${node.nodeId}</div> `}
					</li>
				`;
			};

			return html`
				<ul id="catalog-tree-root">
					${repeat(
						catalogTree,
						(node) => node.nodeId,
						(node) => getNodeHtml(node)
					)}
				</ul>
			`;
		};

		return html`
			<style>
				${css}
			</style>

			<div class="catalog-container">${getCatalogTreeHtml()}</div>
		`;
	}

	_prepareTree(tree) {
		// Traverses the provided tree and creates an unique identifier "nodeId" for each node.
		const prepareNode = (node) => {
			if (node.nodeId === undefined) {
				node.nodeId = createUniqueId();
			}

			if (node.children !== undefined) {
				if (node.foldout === undefined) {
					node.foldout = false;
				}

				for (const child of node.children) {
					prepareNode(child);
				}
			}
		};

		if (!Array.isArray(tree)) {
			return [];
		}

		for (const node of tree) {
			prepareNode(node);
		}

		return tree;
	}

	_removeNodeById(nodeId) {
		const traverseAndRemove = (nodes) => {
			for (let i = 0; i < nodes.length; i++) {
				const currentNode = nodes[i];

				if (currentNode.nodeId === nodeId) {
					nodes.splice(i, 1);
				}

				if (currentNode.children !== undefined) {
					traverseAndRemove(currentNode.children);
				}
			}
		};

		traverseAndRemove(this.catalogTree);
	}

	_updateNode(node) {
		const traverseAndUpdate = (nodes) => {
			for (let i = 0; i < nodes.length; i++) {
				const currentNode = nodes[i];

				if (currentNode.nodeId === node.nodeId) {
					nodes[i] = { ...node };
				}

				if (currentNode.children !== undefined) {
					traverseAndUpdate(currentNode.children);
				}
			}
		};

		traverseAndUpdate(this.catalogTree);
	}

	_addNodeAt(nodeId, newNode, insertBefore = false) {
		let subTree = this.catalogTree;
		let subTreeIndex = -1;

		const traverse = (nodes) => {
			for (let i = 0; i < nodes.length; i++) {
				const currentNode = nodes[i];

				if (currentNode.nodeId === nodeId) {
					subTree = nodes;
					subTreeIndex = i;
					return true;
				}

				if (currentNode.children === undefined) {
					continue;
				}

				if (traverse(currentNode.children)) {
					return true;
				}
			}

			return false;
		};

		traverse(this.catalogTree);
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

	set catalogTree(value) {
		const deeplyClonedValue = JSON.parse(JSON.stringify(value));
		this.signal(Update_Catalog_Tree, this._prepareTree(deeplyClonedValue));
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
