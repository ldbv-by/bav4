import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LocationResultsPanel } from './types/location/LocationResultsPanel';
import { GeoResouceResultsPanel } from './types/geoResource/GeoResourceResultsPanel';
import { AbstractContentPanel } from '../../../menu/components/mainMenu/content/AbstractContentPanel';

/**
 * Container for different types of search result panels.
 * @class
 * @author taulinger
 */
export class SearchResultsPanel extends AbstractContentPanel {

	/**
     *
     */
	createView() {
		return html`
		<div class="search-results-panel">
		${unsafeHTML(`<${LocationResultsPanel.tag}/>`)}
		${unsafeHTML(`<${GeoResouceResultsPanel.tag}/>`)}
		</div>
        `;
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
