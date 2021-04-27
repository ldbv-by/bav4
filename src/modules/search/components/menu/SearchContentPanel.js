import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { debounced } from '../../../../utils/timer';
import { BaElement } from '../../../BaElement';
import css from './searchContentPanel.css';


/**
 * Display search result items.
 * @class
 * @author taulinger
 */
export class SearchContentPanel extends BaElement {


	constructor() {
		super();
		const { SearchResultProviderService: providerService,  TranslationService: translationService }
			= $injector.inject('SearchResultProviderService', 'TranslationService');

		this._providerService = providerService;
		this._translationService = translationService;
		this._locationSearchResults = [];
		this._geoRersourceSearchResults = [];
	}

	async _requestData(term, provider) {
		if (term.trim().length > SearchContentPanel.Min_Query_Length) {
			try {
				const result = await provider(term);
				return result;
			}
			catch (error) {
				console.warn(error.message);
				return [];
			}
		}
		else {
			return [];
		}
	}


	initialize() {
		const locationProvider = this._providerService.getLocationSearchResultProvider();
		const geoResourceProvider = this._providerService.getGeoresourceSearchResultProvider();

		const requestLocationDataAndUpdateViewHandler = debounced(SearchContentPanel.Debounce_Delay,
			async (term) => {
				this._locationSearchResults = await this._requestData(term, locationProvider);
				this.render();
			});

		const requestgeoResourceDataAndUpdateViewHandler = debounced(SearchContentPanel.Debounce_Delay,
			async (term) => {
				this._locationSearchResults = await this._requestData(term, geoResourceProvider);
				this.render();
			});

		this.observe('term', (term) => {
			if (term) {
				requestLocationDataAndUpdateViewHandler(term);
				requestgeoResourceDataAndUpdateViewHandler(term);
			}
		});
		const { term } = this._state;
		if (term) {
			requestLocationDataAndUpdateViewHandler(term);
			requestgeoResourceDataAndUpdateViewHandler(term);
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
		<div class="search-content-panel">
			<div class="location">
				<div class="location-label">${translate('search_menu_contentPanel_location_label')}:</div>
					<ul class="location-items">
						${this._locationSearchResults.map((result) => html`<ba-search-content-panel-location-item .data=${result}></<ba-search-content-panel-location-item>`)}
					</ul>
				</div>
			
			<div class="georsource">
				<div class="georesource-label">${translate('search_menu_contentPanel_georesources_label')}:</div>
				<ul class="georesource-items">
					${this._locationSearchResults.map((result) => html`<ba-search-content-panel-georesource-item .data=${result}></<ba-search-content-panel-georesource-item>`)}
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
		return 'ba-search-content-panel';
	}

	static get Debounce_Delay() {
		return 200;
	}

	static get Min_Query_Length() {
		return 2;
	}
}
