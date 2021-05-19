import { html, nothing } from 'lit-html';
import { BaElement } from '../../../../BaElement';
import css from './CatalogLeaf.css';

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
			<style>${css}</style>
            	<div class="ba-list-item">
				<div class="ba-list-item__text">${geoResourceId}</div>
				</div>
        	`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-leaf';
	}
}
