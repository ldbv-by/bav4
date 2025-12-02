/**
 * @module modules/topics/components/menu/catalog/CatalogNode
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './catalogNode.css';
import { AbstractMvuContentPanel } from '../../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { round } from '../../../../../utils/numberUtils';
import { addOpenNode, removeOpenNode } from '../../../../../store/catalog/catalog.action';

const Update_Collapsed = 'update_collapsed';
const Update_Level = 'update_level';
const Update_CatalogNode = 'update_catalogNode';

/**
 * @class
 * @property {module:domain/catalogTypeDef~CatalogNode} data The catalog entry for this CatalogNode
 * @property {number} level The level of this CatalogNode (integer)
 * @author taulinger
 * @author alsturm
 */
export class CatalogNode extends AbstractMvuContentPanel {
	constructor() {
		super({ level: 0, collapsed: true, catalogNode: null });
	}

	set data(catalogNode) {
		this.signal(Update_CatalogNode, catalogNode);
		if (catalogNode.open) {
			addOpenNode(catalogNode.id);
		}
	}

	set level(level) {
		this.signal(Update_Level, round(level));
	}

	onInitialize() {
		this.observe(
			(store) => store.catalog.openNodes,
			(openNodes) => {
				if (this.getModel().catalogNode) {
					const collapsed = !openNodes.includes(this.getModel().catalogNode?.id);
					this.signal(Update_Collapsed, collapsed);
				}
			}
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_CatalogNode:
				return { ...model, catalogNode: data };
			case Update_Collapsed:
				return { ...model, collapsed: data };
			case Update_Level:
				return { ...model, level: data };
		}
	}

	createView(model) {
		const { level, collapsed, catalogNode } = model;
		const toggleCollapse = () => {
			collapsed ? addOpenNode(catalogNode.id) : removeOpenNode(catalogNode.id);
		};

		const iconCollapseClass = {
			iconexpand: !collapsed
		};

		const bodyCollapseClass = {
			iscollapse: collapsed
		};

		if (catalogNode) {
			const { label, children } = catalogNode;
			const childElements = children.map((child) => {
				//node
				if (child.children) {
					return html`<div><ba-catalog-node .data=${child} .level=${level + 1}></ba-catalog-node></div>`;
				}
				//leaf
				return html`<div><ba-catalog-leaf .data=${child}></ba-catalog-leaf></div>`;
			});

			const nodeLevelCss = `.sub-divider{--node-level: ${level - 1}em;}`;

			if (level === 0) {
				return html`
					<style>
						${css}
					</style>
					<div class="ba-section divider">
						<button id="list-item-button" data-test-id class="ba-list-item ba-list-item__header" @click=${toggleCollapse}>
							<span class="ba-list-item__text  ba-list-item__primary-text">${label}</span>
							<span class="ba-list-item__after">
								<i class="icon icon-rotate-90 chevron ${classMap(iconCollapseClass)}"></i>
							</span>
						</button>
						<div class=" collapse-content ${classMap(bodyCollapseClass)}"><div>${childElements}</div></div>
					</div>
				`;
			} else {
				return html`
					<style>
						${nodeLevelCss}
						${css}
					</style>
					<div class="sub-divider">
						<div class="ba-list-item  ba-list-item__sub-header" @click=${toggleCollapse}>
							<span class="sub-icon"></span>
							<span class="ba-list-item__text  ba-list-item__primary-text"> ${label}</span>
							<span class="ba-list-item__after">
								<i class="icon icon-rotate-90 chevron ${classMap(iconCollapseClass)}"></i>
							</span>
						</div>
						<div class=" collapse-content ${classMap(bodyCollapseClass)}"><div>${childElements}</div></div>
					</div>
				`;
			}
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-node';
	}
}
