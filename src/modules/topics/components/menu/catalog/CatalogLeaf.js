import { html, nothing } from 'lit-html';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';


/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogLeaf extends AbstractContentPanel {

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}

	createView() {

		if (this._catalogPart) {
			const { geoResourceId } = this._catalogPart;
			return html`
			<a href='#' tabindex='0' class="ba-list-item">
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__icon-info"></span>
					</span>
					<span class="ba-list-item__text">${geoResourceId}</span>
					<button class="ba-icon-button ba-list-item__after verticla-center seperator">						
						<span  class='icon-background'>
						 </span>
						<i class='icon icon-secondary info'></i>
					</button>
				</a>
        	`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-leaf';
	}
}
