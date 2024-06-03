/**
 * @module modules/search/components/menu/types/geoResource/GeoResourceResultsPanel
 */
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../../../injection';
import { debounced } from '../../../../../../utils/timer';
import { MvuElement } from '../../../../../MvuElement';
import { requestData } from '../resultPanelUtils';
import css from './geoResourceResultsPanel.css';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { createUniqueId } from '../../../../../../utils/numberUtils';
import { GeoResourceResultItem } from './GeoResourceResultItem';

const Update_Collapsed = 'update_collapsed';
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
	constructor() {
		super({
			results: [],
			collapsed: false,
			allShown: false,
			activeLayers: []
		});
		const {
			SearchResultService: searchResultService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService
		} = $injector.inject('SearchResultService', 'TranslationService', 'GeoResourceService');

		this._searchResultService = searchResultService;
		this._translationService = translationService;
		this._geoResourceService = geoResourceService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Collapsed:
				return { ...model, collapsed: data };
			case Update_AllShown:
				return { ...model, allShown: data };
			case Update_Results_AllShown:
				return { ...model, ...data };
			case Update_ActiveLayers:
				return { ...model, activeLayers: data.map((l) => ({ geoResourceId: l.geoResourceId, id: l.id })) };
		}
	}

	onInitialize() {
		const searchResultProvider = (term) => this._searchResultService.geoResourcesByTerm(term);

		//requestData call has to be debounced
		const requestGeoResourceDataAndUpdateViewHandler = debounced(GeoResourceResultsPanel.Debounce_Delay, async (term) => {
			if (term) {
				const results = await requestData(term, searchResultProvider, GeoResourceResultsPanel.Min_Query_Length);
				const allShown = results.length > GeoResourceResultsPanel.Default_Result_Item_Length ? false : true;
				this.signal(Update_Results_AllShown, { results, allShown });
			} else {
				this.signal(Update_Results_AllShown, { results: [], allShown: false });
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
		const { collapsed, allShown, results } = model;

		const translate = (key) => this._translationService.translate(key);

		const isLayerActive = (geoResourceId) => {
			return model.activeLayers
				.filter((l) => l.id !== GeoResourceResultItem._tmpLayerId(geoResourceId))
				.some((l) => l.geoResourceId === geoResourceId);
		};

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

		const indexEnd = allShown ? results.length : GeoResourceResultsPanel.Default_Result_Item_Length;

		const allLayersActive = results.every((l) => isLayerActive(l.geoResourceId));
		const importAll = () => {
			results.filter((l) => !isLayerActive(l.geoResourceId)).forEach(enableLayer);
		};
		const removeAll = () => {
			results.filter((l) => isLayerActive(l.geoResourceId)).forEach(disableLayer);
		};
		const enableLayer = (result) => {
			const geoR = this._geoResourceService.byId(result.geoResourceId);
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
			hidden: results && results.length < 2
		};

		return html`
			<style>
				${css}
			</style>
			<div class="georesource-results-panel divider">
				<button class="georesource-label" @click="${toggleCollapse}">
					<span class="georesource-label__text">${translate('search_menu_geoResourceResultsPanel_label')}</span>
					<a class="georesource-label__collapse">
						<i class="icon chevron ${classMap(iconCollapseClass)}"> </i>
					</a>
				</button>
				<div class="${classMap(bodyCollapseClass)}">
					<ul class="georesource-items">
						${results
							.slice(0, indexEnd)
							.map(
								(result) => html`<ba-search-content-panel-georesource-item data-test-id .data=${result}></<ba-search-content-panel-georesource-item>`
							)}
					</ul>
					<div class="show-all ${classMap(showAllButton)}" tabindex="0" @click="${toggleShowAll}">${translate('search_menu_showAll_label')}</div>
					<ba-button
						id="import-all"
						class="${classMap(importAllButton)}"
						.label=${allLayersActive ? translate('search_menu_removeAll_label') : translate('search_menu_importAll_label')}
						@click=${allLayersActive ? removeAll : importAll}
					></ba-button>
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
		return 7;
	}
}
