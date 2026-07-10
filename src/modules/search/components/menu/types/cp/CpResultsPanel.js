/**
 * @module modules/search/components/menu/types/cp/CpResultsPanel
 */
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../../../injection';
import { debounced } from '../../../../../../utils/timer';
import { MvuElement } from '../../../../../MvuElement';
import { requestData } from '../resultPanelUtils';
import css from './cpResultsPanel.css?inline';
import showAllSvg from '../../assets/three-dots.svg';

const Update_AllShown = 'update_allShown';
const Update_Results_AllShown = 'update_results_allShown';

/**
 * Displays cadastral parcel search results.
 * @class
 * @author costa_gi
 */
export class CpResultsPanel extends MvuElement {
	#searchResultService;
	#translationService;
	#onShowAll;

	constructor() {
		super({
			results: [],
			allShown: false
		});
		const { SearchResultService: searchResultService, TranslationService: translationService } = $injector.inject(
			'SearchResultService',
			'TranslationService'
		);

		this.#searchResultService = searchResultService;
		this.#translationService = translationService;
		this.#onShowAll = () => {};
	}

	update(type, data, model) {
		switch (type) {
			case Update_AllShown:
				return { ...model, allShown: data };
			case Update_Results_AllShown:
				return { ...model, ...data };
		}
	}

	onInitialize() {
		const searchResultProvider = (term) => this.#searchResultService.cadastralParcelsByTerm(term);

		//requestData call has to be debounced
		const requestCpDataAndUpdateViewHandler = debounced(CpResultsPanel.Debounce_Delay, async (term) => {
			if (term) {
				const results = await requestData(term, searchResultProvider, CpResultsPanel.Min_Query_Length);
				const allShown = results.length > CpResultsPanel.Default_Result_Item_Length ? false : true;
				this.signal(Update_Results_AllShown, { results, allShown });
			} else {
				this.signal(Update_Results_AllShown, { results: [], allShown: false });
			}
		});

		this.observe(
			(state) => state.search.query,
			(query) => requestCpDataAndUpdateViewHandler(query.payload)
		);
	}

	/**
	 * @override
	 */
	createView(model) {
		const { allShown, results } = model;
		const translate = (key) => this.#translationService.translate(key);

		const showAllItems = () => {
			this.#onShowAll();
		};

		const showAllButton = {
			hidden: allShown || results.length < CpResultsPanel.Default_Result_Item_Length
		};

		const indexEnd = allShown ? results.length : CpResultsPanel.Default_Result_Item_Length;

		return html`
			<style>
				${css}
			</style>
			<div class="cp-results-panel divider">
				<button class="cp-label">
					<span class="cp-label__text">${translate('search_menu_cpResultsPanel_label')}</span>
					<ba-badge class="results-count" .background=${'var(--secondary-color)'} .label=${results.length} .color=${'var(--text5)'}></ba-badge>
				</button>
				<div>
					<ul class="cp-items">
						${results
							.slice(0, indexEnd)
							.map((result) => html`<ba-search-content-panel-cp-item data-test-id .data=${result}></<ba-search-content-panel-cp-item>`)}
					</ul>
					<ba-button
						id="show-all"
						.label=${translate('search_menu_showAll_label')}
						.icon=${showAllSvg}
						@click=${showAllItems}
						class=${classMap(showAllButton)}
						tabindex="0"
					>
					</ba-button>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-cp-results-panel';
	}

	static get Debounce_Delay() {
		return 200;
	}

	static get Min_Query_Length() {
		return 2;
	}

	static get Default_Result_Item_Length() {
		return 4;
	}

	set allShown(value) {
		this.signal(Update_AllShown, value);
	}

	set onShowAll(callback) {
		this.#onShowAll = callback;
	}
}
