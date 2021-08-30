import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
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
		const { SearchResultService: searchResultService, TranslationService: translationService }
            = $injector.inject('SearchResultService', 'TranslationService');

		this._searchResultService = searchResultService;
		this._translationService = translationService;
		this._locationSearchResults = [];
		this._isCollapsed = false;
	}


	initialize() {
		const searchResultProvider = (term) => this._searchResultService.locationsByTerm(term);

		//requestData call has to be debounced
		const requestLocationDataAndUpdateViewHandler = debounced(LocationResultsPanel.Debounce_Delay,
			async (term) => {
				this._locationSearchResults = await requestData(term, searchResultProvider, LocationResultsPanel.Min_Query_Length);
				this.render();
			});

		this.observe('term', term => requestLocationDataAndUpdateViewHandler(term), true);
	}

	onStateChanged() {
		//we do nothing here, because we will call #render() manually after search results are available
	}


	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const toggleCollapse = () => {
			if (this._locationSearchResults.length) {
				this._isCollapsed = !this._isCollapsed;
				this.render();
			}
		};

		const iconCollapseClass = {
			iconexpand: !this._isCollapsed,
			isdisabled: !this._locationSearchResults.length
		};

		const bodyCollapseClass = {
			iscollaps: this._isCollapsed
		};

		return html`
        <style>${css}</style>
		<div class="location-results-panel">
			<div class="location-label">
				<span class="location-label__text">${translate('search_menu_locationResultsPanel_label')}</span>			
				<a class='location-label__collapse' @click="${toggleCollapse}">
					<i class='icon chevron ${classMap(iconCollapseClass)}'>
					</i>
				</a>   
			</div>			
			<ul class="location-items divider ${classMap(bodyCollapseClass)}">	
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
