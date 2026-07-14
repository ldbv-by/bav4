/**
 * @module modules/search/components/menu/types/geoResource/GeoResourceResultsPanel
 */
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../../../injection';
import { debounced } from '../../../../../../utils/timer';
import { MvuElement } from '../../../../../MvuElement';
import { requestData } from '../resultPanelUtils';
import css from './geoResourceResultsPanel.css?inline';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { createUniqueId } from '../../../../../../utils/numberUtils';
import { GeoResourceResultItem } from './GeoResourceResultItem';
import importSvg from '../../assets/file-import.svg';
import showAllSvg from '../../assets/three-dots.svg';

const Update_AllShown = 'update_allShown';
const Update_Results_AllShown = 'update_results_allShown';
const Update_ActiveLayers = 'update_activeLayers';

/**
 * Displays GeoResource search results.
 * @class
 * @author taulinger
 * @author alsturm
 */
export class GeoResourceResultsPanel extends MvuElement {
	#searchResultService;
	#translationService;
	#geoResourceService;
	#onShowAll;

	constructor() {
		super({
			results: [],
			allShown: false,
			activeLayers: []
		});
		const {
			SearchResultService: searchResultService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService
		} = $injector.inject('SearchResultService', 'TranslationService', 'GeoResourceService');

		this.#searchResultService = searchResultService;
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
		this.#onShowAll = () => {};
	}

	update(type, data, model) {
		switch (type) {
			case Update_AllShown:
				return { ...model, allShown: data };
			case Update_Results_AllShown:
				return { ...model, ...data };
			case Update_ActiveLayers:
				return { ...model, activeLayers: data.map((l) => ({ geoResourceId: l.geoResourceId, id: l.id })) };
		}
	}

	onInitialize() {
		const searchResultProvider = (term) => this.#searchResultService.geoResourcesByTerm(term);

		//requestData call has to be debounced
		const requestGeoResourceDataAndUpdateViewHandler = debounced(GeoResourceResultsPanel.Debounce_Delay, async (term) => {
			if (term) {
				const results = await requestData(term, searchResultProvider, GeoResourceResultsPanel.Min_Query_Length);
				// const allShown = results.length > GeoResourceResultsPanel.Default_Result_Item_Length ? false : true;
				this.signal(Update_Results_AllShown, { results, allShown: this.getModel().allShown });
			} else {
				this.signal(Update_Results_AllShown, { results: [], allShown: this.getModel().allShown });
			}
		});

		this.observe(
			(state) => state.layers.active,
			(activeLayers) => this.signal(Update_ActiveLayers, activeLayers)
		);
		this.observe(
			(state) => state.search.query,
			(query) => requestGeoResourceDataAndUpdateViewHandler(query.payload)
		);
	}

	/**
	 * @override
	 */
	createView(model) {
		const { allShown, results } = model;

		const translate = (key) => this.#translationService.translate(key);

		const isGeoResourceActive = (geoResourceId) => {
			return model.activeLayers
				.filter((l) => l.id !== GeoResourceResultItem._tmpLayerId(geoResourceId))
				.some((l) => l.geoResourceId === geoResourceId);
		};

		const toggleShowAll = () => {
			this.#onShowAll();
		};

		const showAllButton = {
			hidden: allShown || results.length < GeoResourceResultsPanel.Default_Result_Item_Length
		};

		const indexEnd = allShown ? results.length : GeoResourceResultsPanel.Default_Result_Item_Length;

		const allLayersActive = results.every((l) => isGeoResourceActive(l.geoResourceId));
		const importAll = () => {
			results.filter((l) => !isGeoResourceActive(l.geoResourceId)).forEach(enableLayer);
		};
		const removeAll = () => {
			results.filter((l) => isGeoResourceActive(l.geoResourceId)).forEach(disableLayer);
		};
		const enableLayer = (result) => {
			const geoR = this.#geoResourceService.byId(result.geoResourceId);
			if (geoR) {
				const id = `${result.geoResourceId}_${createUniqueId()}`;
				const opacity = geoR.opacity;
				addLayer(id, { geoResourceId: result.geoResourceId, opacity });
			}
		};
		const disableLayer = (result) => {
			model.activeLayers.filter((l) => l.geoResourceId === result.geoResourceId).forEach((l) => removeLayer(l.id));
		};
		const importAllButton = {
			hidden: results.length < 2
		};

		return html`
			<style>
				${css}
			</style>
			<div class="georesource-results-panel divider">
				<button class="georesource-label">
					<span class="georesource-label__text">${translate('search_menu_geoResourceResultsPanel_label')}</span>
					<ba-badge class="results-count" .background=${'var(--secondary-color)'} .label=${results.length} .color=${'var(--text5)'}></ba-badge>
				</button>
				<div>
					<ul class="georesource-items">
						${results
							.slice(0, indexEnd)
							.map(
								(result) => html`<ba-search-content-panel-georesource-item data-test-id .data=${result}></<ba-search-content-panel-georesource-item>`
							)}
					</ul>
					<ba-button
						id="show-all"
						.label=${translate('search_menu_showAll_label')}
						.icon=${showAllSvg}
						@click=${toggleShowAll}
						class=${classMap(showAllButton)}
					>
					</ba-button>
					<ba-button
						id="import-all"
						.label=${allLayersActive ? translate('search_menu_removeAll_label') : translate('search_menu_importAll_label')}
						.title=${allLayersActive ? translate('search_menu_removeAll_title') : translate('search_menu_importAll_title')}
						.icon=${importSvg}
						@click=${allLayersActive ? removeAll : importAll}
						class=${classMap(importAllButton)}
					>
					</ba-button>
				</div>
			</div>
		`;
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
