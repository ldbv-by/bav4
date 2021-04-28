import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BaElement } from '../../../../../BaElement';
import itemCss from '../item.css';
import css from './geoResourceResultItem.css';



/**
 * Renders an search result item for a geoResource.
 * 
 * Configurable Properties:
 * - `data`
 * 
 * Observed Properties:
 * - `data`
 * 
 * @class
 * @author taulinger
 */
export class GeoResourceResultItem extends BaElement {


	set data(geoResourceSearchResult) {
		this._georesourceSearchResult = geoResourceSearchResult;
		this.render();
	}


	createView() {
		if (this._georesourceSearchResult) {

			return html`
				<style>${itemCss}</style>
				<style>${css}</style>
                <li>${unsafeHTML(this._georesourceSearchResult.labelFormated)}</li>
            `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-georesource-item';
	}
}