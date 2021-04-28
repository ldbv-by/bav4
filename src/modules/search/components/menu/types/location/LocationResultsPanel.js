import { html } from 'lit-html';
import { $injector } from '../../../../../../injection';
import { debounced } from '../../../../../../utils/timer';
import { BaElement } from '../../../../../BaElement';
import { requestData } from '../resultPanelUtils';
import css from './locationResultsPanel.css';


/**
 * Displays location search results.
 * @class
 * @author taulinger
 */
export class LocationResultsPanel extends BaElement {


	constructor() {
		super();
		const { SearchResultProviderService: providerService,  TranslationService: translationService }
			= $injector.inject('SearchResultProviderService', 'TranslationService');

		this._providerService = providerService;
		this._translationService = translationService;
		this._locationSearchResults = [];
	}


	initialize() {
		const locationProvider = this._providerService.getLocationSearchResultProvider();

		const requestLocationDataAndUpdateViewHandler = debounced(LocationResultsPanel.Debounce_Delay,
			async (term) => {
				this._locationSearchResults = await requestData(term, locationProvider, LocationResultsPanel.Min_Query_Length);
				this.render();
			});

		this.observe('term', (term) => {
			if (term) {
				requestLocationDataAndUpdateViewHandler(term);
			}
		});
		const { term } = this._state;
		if (term) {
			requestLocationDataAndUpdateViewHandler(term);
		}
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
			<div class="location-results-panel">
				<div class="location-label">${translate('search_menu_contentPanel_location_label')}:</div>
					<ul class="location-items">
						${this._locationSearchResults.map((result) => html`<ba-search-content-panel-location-item .data=${result}></<ba-search-content-panel-location-item>`)}
					</ul>
				</div>
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
		return 'ba-location-results-panel';
	}

	static get Debounce_Delay() {
		return 200;
	}

	static get Min_Query_Length() {
		return 2;
	}
}
