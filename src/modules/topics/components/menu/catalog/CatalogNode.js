import { html, nothing } from 'lit-html';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './catalogNode.css';

/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogNode extends AbstractContentPanel {

	constructor() {
		super();

		this._catalogPart = null;
		this._isCollapsed = true;
		this._level = 0;
	}

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		const { open } = this._catalogPart;
		this._isCollapsed = !open;
		this.render();
	}


	initialize() {
		this._level = this.getAttribute('level') ? parseInt(this.getAttribute('level')) : 0;
	}

	onStateChanged() {
		//nothing to do here: initial rendering does it
	}

	createView() {

		const toggleCollapse = () => {
			this._isCollapsed = !this._isCollapsed;
			this.render();
		};

		const iconCollapseClass = {
			iconexpand: !this._isCollapsed
		};

		const bodyCollapseClass = {
			iscollapse: this._isCollapsed
		};

		if (this._catalogPart) {
			const { label, children } = this._catalogPart;
			const childElements = children.map(child => {
				//node
				if (child.children) {
					return html`<div> <ba-catalog-node .data=${child} level=${(this._level + 1)}></ba-catalog-node></div>`;
				}
				//leaf
				return html`<div><ba-catalog-leaf .data=${child}></ba-catalog-leaf></div>`;
			});

			if (this._level === 0) {
				return html`
				<style>
				${css}
				</style>
			<div class='ba-section divider'>
				<button id='list-item-button' data-test-id class="ba-list-item ba-list-item__header" @click="${toggleCollapse}">
					<span class="ba-list-item__text  ba-list-item__primary-text" >${label}</span>
					<span class="ba-list-item__after">
						<i class='icon icon-rotate-90 chevron ${classMap(iconCollapseClass)}'></i>
					</span>
				</button>		
				<div class=" collapse-content ${classMap(bodyCollapseClass)}">	
            		${childElements}
				</div>	
			</div>			
        	`;
			}
			else {
				return html`
				<div class='sub-divider'>
					<div class="ba-list-item  ba-list-item__sub-header">
						<span class="ba-list-item__text  ba-list-item__primary-text">${label}</span>					
					</div>		
					<div>	
						${childElements}
					</div>	
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
