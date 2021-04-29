import { html } from 'lit-html';
import { $injector } from '../../../../../../injection';
import { debounced } from '../../../../../../utils/timer';
import { BaElement } from '../../../../../BaElement';
import { requestData } from '../resultPanelUtils';
import css from './geoResourceResultsPanel.css';


/**
 * Displays geoResource search results.
 * @class
 * @author taulinger
 */
export class GeoResouceResultsPanel extends BaElement {


	constructor() {
		super();
		const { SearchResultProviderService: providerService, TranslationService: translationService }
            = $injector.inject('SearchResultProviderService', 'TranslationService');

		this._providerService = providerService;
		this._translationService = translationService;
		this._geoRersourceSearchResults = [];
	}


	initialize() {
		const geoResourceProvider = this._providerService.getGeoresourceSearchResultProvider();

		const requestGeoResourceDataAndUpdateViewHandler = debounced(GeoResouceResultsPanel.Debounce_Delay,
			async (term) => {
				this._geoRersourceSearchResults = await requestData(term, geoResourceProvider, GeoResouceResultsPanel.Min_Query_Length);
				this.render();
			});

		this.observe('term', (term) => requestGeoResourceDataAndUpdateViewHandler(term), true);
	}

	onStateChanged() {
		//we we do nothing here, because we will call #render() manually after search results are available
	}


	/**
     * @override
     */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		return html`
        <style>${css}</style>
			<div class="georesource-results-panel">
				<div class="georesource-label">${translate('search_menu_geoResourceResultsPanel_label')}:</div>
				<ul class="georesource-items">
					${this._geoRersourceSearchResults.map((result) => html`<ba-search-content-panel-georesource-item .data=${result}></<ba-search-content-panel-georesource-item>`)}
				</ul>
			</div>
        `;
	}

	/**
     * @override
     * @param {Object} state 
     */
	extractState(state) {
		const { search: { query: { payload: term } } } = state;
		return { term };
	}

	static get tag() {
		return 'ba-georesource-results-panel';
	}

	static get Debounce_Delay() {
		return 200;
	}

	static get Min_Query_Length() {
		return 2;
	}
}
