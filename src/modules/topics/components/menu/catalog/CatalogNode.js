import { html, nothing } from 'lit-html';
import { BaElement } from '../../../../BaElement';

/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogNode extends BaElement {

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}

	createView() {

		if (this._catalogPart) {
			const { label, children } = this._catalogPart;
			const childElements = children.map(child => {
				//node
				if (child.children) {
					return html`<ba-catalog-node .data=${child}></ba-catalog-node>`;
				}
				//leaf
				return html`<ba-catalog-leaf .data=${child}></ba-catalog-leaf>`;
			});

			return html`
            <div>${label}</div>
            <div>${childElements}</div>
        `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-node';
	}
}
