import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LocationResultsPanel } from './types/location/LocationResultsPanel';
import { GeoResouceResultsPanel } from './types/geoResource/GeoResourceResultsPanel';
import { AbstractMvuContentPanel } from '../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { CpResultsPanel } from './types/cp/CpResultsPanel';

/**
 * Container for different types of search result panels.
 * @class
 * @author taulinger
 * @author costa_gi
 */
export class SearchResultsPanel extends AbstractMvuContentPanel {

	/**
	 *
	 */
	createView() {
		return html`
		<div class="search-results-panel">
		${unsafeHTML(`<${LocationResultsPanel.tag}/>`)}
		${unsafeHTML(`<${GeoResouceResultsPanel.tag}/>`)}
		${unsafeHTML(`<${CpResultsPanel.tag}/>`)}
		</div>
        `;
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
