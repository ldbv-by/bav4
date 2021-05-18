import { html, nothing } from 'lit-html';
import { BaElement } from '../../../../BaElement';

/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogLeaf extends BaElement {

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}



	createView() {

		if (this._catalogPart) {
			const { geoResourceId } = this._catalogPart;
			return html`
            	<div>${geoResourceId}</div>
        	`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-leaf';
	}
}