/**
 * @module modules/admin/components/Catalog
 */
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import css from './catalog.css';

const Update_Catalog_Tree = 'update_catalog_tree';

/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class Catalog extends MvuElement {
	constructor() {
		super({
			catalogTree: []
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
				return { ...model, catalogTree: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const onDragEnter = (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			console.log(evt.currentTarget);
		};

		const { catalogTree } = model;
		const getNodeHtml = (node, treeIndex, localNodeIndex) => {
			if (node.children !== undefined) {
				return html`
					<li data-tree-index=${treeIndex} data-local-node-index=${localNodeIndex} @dragenter=${onDragEnter}>
						<div class="catalog-node group">
							<div class="title-bar">A Group Node</div>
							<div class="btn-bar">
								<button>+</button>
								<button>Dup</button>
								<button>X</button>
							</div>
						</div>
						<ul>
							${repeat(
								node.children,
								(childNode) => childNode,
								(childNode, index) => getNodeHtml(childNode, treeIndex + 1, index)
							)}
						</ul>
					</li>
				`;
			}

			// Leaf Node / Geo Resource.
			return html`<li data-tree-index=${treeIndex} data-local-node-index=${localNodeIndex} @dragenter=${onDragEnter}>
				<div class="catalog-node geo-resource">A Geo Resource</div>
			</li>`;
		};

		return html`
			<style>
				${css}
			</style>

			<div class="catalog-container">
				<ul class="catalog-tree-root" @dragenter=${onDragEnter}>
					${repeat(
						catalogTree,
						(node) => node,
						(node, index) => getNodeHtml(node, 0, index)
					)}
				</ul>
			</div>
		`;
	}

	set catalogTree(value) {
		console.log(value);
		this.signal(Update_Catalog_Tree, value);
	}

	static get tag() {
		return 'ba-catalog';
	}
}
