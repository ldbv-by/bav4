import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BaElement } from '../../../../../BaElement';
import itemCss from '../item.css';
import css from './locationResultItem.css';



/**
 * Renders an search result item for a location.
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
export class LocationResultItem extends BaElement {


	set data(locationSearchResult) {
		this._locationSearchResult = locationSearchResult;
		this.render();
	}


	createView() {
		if (this._locationSearchResult) {

			return html`
				<style>${itemCss}</style>
				<style>${css}</style>
                <li>${unsafeHTML(this._locationSearchResult.labelFormated)}</li>
            `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-location-item';
	}
}