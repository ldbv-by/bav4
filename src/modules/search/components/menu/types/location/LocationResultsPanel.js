import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../../../injection';
import { debounced } from '../../../../../../utils/timer';
import { MvuElement } from '../../../../../MvuElement';
import { requestData } from '../resultPanelUtils';
import css from './locationResultsPanel.css';

const Update_Collapsed = 'update_collapsed';
const Update_AllShown = 'update_allShown';
const Update_Results_AllShown = 'update_results_allShown';

/**
 * Displays Location search results.
 * @class
 * @author taulinger
 * @author alsturm
 */
export class LocationResultsPanel extends MvuElement {


	constructor() {
		super({
			results: [],
			collapsed: false,
			allShown: false
		});
		const { SearchResultService: searchResultService, TranslationService: translationService }
			= $injector.inject('SearchResultService', 'TranslationService');

		this._searchResultService = searchResultService;
		this._translationService = translationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Collapsed:
				return { ...model, collapsed: data };
			case Update_AllShown:
				return { ...model, allShown: data };
			case Update_Results_AllShown:
				return { ...model, ...data };
		}
	}

	onInitialize() {
		const searchResultProvider = (term) => this._searchResultService.locationsByTerm(term);

		//requestData call has to be debounced
		const requestLocationDataAndUpdateViewHandler = debounced(LocationResultsPanel.Debounce_Delay,
			async (term) => {
				if (term) {
					const results = await requestData(term, searchResultProvider, LocationResultsPanel.Min_Query_Length);
					const allShown = (results.length > LocationResultsPanel.Default_Result_Item_Length) ? false : true;
					this.signal(Update_Results_AllShown, { results, allShown });
				}
				else {
					this.signal(Update_Results_AllShown, { results: [], allShown: false });
				}
			});

		this.observe(state => state.search.query, query => requestLocationDataAndUpdateViewHandler(query.payload));
	}

	/**
	 * @override
	 */
	createView(model) {
		const { collapsed, allShown, results } = model;
		const translate = (key) => this._translationService.translate(key);

		const toggleCollapse = () => {
			if (results.length) {
				this.signal(Update_Collapsed, !collapsed);
			}
		};

		const toggleShowAll = () => {
			this.signal(Update_AllShown, !allShown);
		};

		const iconCollapseClass = {
			iconexpand: !collapsed,
			isdisabled: !results.length
		};

		const bodyCollapseClass = {
			iscollaps: collapsed
		};

		const showAllButton = {
			hidden: allShown || results.length === 0
		};

		const indexEnd = allShown ? results.length : LocationResultsPanel.Default_Result_Item_Length;

		return html`
        <style>${css}</style>
		<div class="location-results-panel divider">
			<button class="location-label" @click="${toggleCollapse}">
				<span class="location-label__text">${translate('search_menu_locationResultsPanel_label')}</span>			
				<a class='location-label__collapse'>
					<i class='icon chevron ${classMap(iconCollapseClass)}'>
					</i>
				</a>   
			</button>		
			<div class="${classMap(bodyCollapseClass)}">		
				<ul class="location-items">	
					${results
		.slice(0, indexEnd)
		.map((result) => html`<ba-search-content-panel-location-item .data=${result}></<ba-search-content-panel-location-item>`)}
				</ul>
				<div class="show-all ${classMap(showAllButton)}" tabindex="0" @click="${toggleShowAll}">
				${translate('search_menu_showAll_label')}
				</div>
			</div>	
		</div>
        `;
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

	static get Default_Result_Item_Length() {
		return 7;
	}
}
