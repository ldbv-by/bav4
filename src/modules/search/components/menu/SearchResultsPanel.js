/**
 * @module modules/search/components/menu/SearchResultsPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';
import { findAllBySelector, findClosest } from '../../../../utils/markup';
import { LocationResultItem } from './types/location/LocationResultItem';
import { LocationResultsPanel } from './types/location/LocationResultsPanel';
import { GeoResourceResultItem } from './types/geoResource/GeoResourceResultItem';
import { GeoResourceResultsPanel } from './types/geoResource/GeoResourceResultsPanel';
import { focusSearchField } from '../../../../store/mainMenu/mainMenu.action';
import { CpResultItem } from './types/cp/CpResultItem';
import { CpResultsPanel } from './types/cp/CpResultsPanel';
import { Header } from '../../../header/components/Header';
import { MainMenu } from '../../../menu/components/mainMenu/MainMenu';
import { Selected_Item_Class, Highlight_Item_Class } from './AbstractResultItem';
import { $injector } from '../../../../injection';
import css from './searchResultsPanel.css?inline';

export const Navigatable_Result_Item_Class = [LocationResultItem, GeoResourceResultItem, CpResultItem];

const Highlighted_Item_Class_Selector = `.${Highlight_Item_Class}`;
const Selected_Item_Class_Selector = `.${Selected_Item_Class}`;
const Hover_Selector = `:is(:hover)`;
const Search_Field_Index = -1;
const No_Op = () => {};
const Update_Current_Category = 'update_current_category';

/**
 * @readonly
 * @enum {String}
 */
export const SearchTabs = Object.freeze({
	ALL: 'all',
	LOCATION: LocationResultsPanel.tag,
	GEORESOURCE: GeoResourceResultsPanel.tag,
	CP: CpResultsPanel.tag
});

/**
 * Container for different types of search result panels.
 * @class
 * @property {Array<AbstractResultItem>} resultItemClasses The ResultItemClasses which are used to define the query selector for all navigatable ResultItems.
 * @author taulinger
 * @author costa_gi
 * @author thiloSchlemmer
 * @author alsturm
 */
export class SearchResultsPanel extends AbstractMvuContentPanel {
	#keyActionMapper;
	#selectedIndex;
	#resultItemClasses;
	#resultItemSelector;
	#translationService;

	constructor(keyActionMapper = new KeyActionMapper(document)) {
		super({
			activeCategory: SearchTabs.ALL
		});
		this.#keyActionMapper = keyActionMapper;
		this.#selectedIndex = null;
		this.#resultItemClasses = Navigatable_Result_Item_Class;
		this.#resultItemSelector = `:is(${this.#resultItemClasses.map((i) => i.tag).join(',')})`;

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this.#translationService = translationService;
	}

	/**
	 * @override
	 */
	onInitialize() {
		const selectorAcceptingKeyboardEvents = `:is(${[Header, MainMenu, SearchResultsPanel].map((i) => i.tag).join(',')})`;

		const isBodyOrCloseToComponents = (element) => {
			return document.body === element || document === element || !!findClosest(element, selectorAcceptingKeyboardEvents);
		};
		this.#keyActionMapper
			.addForKeyUp('ArrowDown', (e) => (isBodyOrCloseToComponents(e.target) ? this._arrowDown(e) : No_Op()))
			.addForKeyUp('ArrowUp', (e) => (isBodyOrCloseToComponents(e.target) ? this._arrowUp(e) : No_Op()))
			.addForKeyUp('Enter', (e) => (isBodyOrCloseToComponents(e.target) ? this._enter() : No_Op()));

		this.#keyActionMapper.activate();

		this.observe(
			(state) => state.search.query,
			() => this._reset(),
			false
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Current_Category:
				return { ...model, activeCategory: data };
		}
	}

	/**
	 *
	 */
	createView(model) {
		const { activeCategory } = model;
		const translate = (key) => this.#translationService.translate(key);

		const isActive = (category) => {
			return activeCategory ? (activeCategory === category ? 'is-active' : '') : '';
		};
		const isGridLayout = () => {
			return activeCategory === SearchTabs.ALL ? ' ' : 'grid-layout section scroll-snap-x';
		};

		const setActive = (category) => {
			this.signal(Update_Current_Category, category);

			this.shadowRoot.querySelectorAll('#section > *').forEach((panel) => {
				panel.allShown = category === SearchTabs.ALL ? false : true;
			});

			category !== SearchTabs.ALL ? this.shadowRoot.querySelector(category).scrollIntoView({ block: 'start', behavior: 'smooth' }) : null;
			this._reset();
			switch (category) {
				case SearchTabs.LOCATION:
					this._resultItemClasses([LocationResultItem]);
					return;
				case SearchTabs.GEORESOURCE:
					this._resultItemClasses([GeoResourceResultItem]);
					return;
				case SearchTabs.CP:
					this._resultItemClasses([CpResultItem]);
					return;
				default:
					this._resultItemClasses(Navigatable_Result_Item_Class);
					return;
			}
		};

		return html`
			<style>
				${css}
			</style>
			<div class="search-results-panel">
				<div class="button-group">
					<button class=" ${isActive(SearchTabs.ALL)}" @click=${() => setActive(SearchTabs.ALL)} title="${translate('search_menu_all_label_title')}">
						${translate('search_menu_all_label')}
					</button>
					<button
						class=" ${isActive(SearchTabs.LOCATION)}"
						@click=${() => setActive(SearchTabs.LOCATION)}
						title="${translate('search_menu_locationResultsPanel_label_title')}"
					>
						${translate('search_menu_locationResultsPanel_label')}
					</button>
					<button
						class=" ${isActive(SearchTabs.GEORESOURCE)}"
						@click=${() => setActive(SearchTabs.GEORESOURCE)}
						title="${translate('search_menu_geoResourceResultsPanel_label_title')}"
					>
						${translate('search_menu_geoResourceResultsPanel_label')}
					</button>
					<button
						class=" ${isActive(SearchTabs.CP)}"
						@click=${() => setActive(SearchTabs.CP)}
						title="${translate('search_menu_cpResultsPanel_label_title')}"
					>
						${translate('search_menu_cpResultsPanel_label')}
					</button>
				</div>
				<div id="section" class="${isGridLayout()}" part="section">
					<ba-location-results-panel class="container" .onShowAll=${() => setActive(SearchTabs.LOCATION)}></ba-location-results-panel>
					<ba-georesource-results-panel class="container" .onShowAll=${() => setActive(SearchTabs.GEORESOURCE)}></ba-georesource-results-panel>
					<ba-cp-results-panel class="container" .onShowAll=${() => setActive(SearchTabs.CP)}></ba-cp-results-panel>
				</div>
			</div>
		`;
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this.#keyActionMapper.deactivate();
	}

	_reset() {
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfSelectedItem = this._findSelectedIndex(items);
		this.#selectedIndex = -1;
		this._changeSelectedElement(indexOfSelectedItem, -1, items);
	}

	_arrowDown(e) {
		if (e.shiftKey) {
			return;
		}
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfPreviousItem = this._findSelectedIndex(items);
		const nextIndex = indexOfPreviousItem < 0 ? 0 : indexOfPreviousItem + 1;
		this.#selectedIndex = nextIndex < items.length ? nextIndex : indexOfPreviousItem;

		this._changeSelectedElement(indexOfPreviousItem, this.#selectedIndex, items);
	}

	_arrowUp(e) {
		if (e.shiftKey) {
			return;
		}
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfPreviousItem = this._findSelectedIndex(items);
		const nextIndex = indexOfPreviousItem < 0 ? indexOfPreviousItem : indexOfPreviousItem - 1;
		this.#selectedIndex = nextIndex < 0 ? Search_Field_Index : nextIndex;

		if (this.#selectedIndex === Search_Field_Index) {
			focusSearchField();
		}

		this._changeSelectedElement(indexOfPreviousItem, this.#selectedIndex, items);
	}

	_enter() {
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfSelectedItem = this._findSelectedIndex(items);

		const selectedItem = items[indexOfSelectedItem] ?? null;
		if (selectedItem) {
			selectedItem.selectResult();
		}
	}

	_changeSelectedElement(previousIndex, nextIndex, items) {
		if (previousIndex === nextIndex) {
			return;
		}
		if (previousIndex >= 0) {
			items.forEach((i) => i.highlightResult(false));
		}
		if (nextIndex >= 0) {
			// highlight the selected item and scroll it into the view, if needed
			items[nextIndex].highlightResult(true);
			items[nextIndex].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
		}
	}

	_findSelectedIndex(items) {
		/**
		 * Mouse and keyboard input can be mixed in the process of highlighting and
		 * selecting a result element.
		 * We favour selected results over highlighted results and mouse-highlighted
		 * results over keyboard-highlighted results.
		 */
		const getHighlightIndex = () => {
			const hoverIndex = items.findIndex((element) => element.matches(Hover_Selector));
			const allHighlightIndices = items.flatMap((element, i) => (element.matches(Highlighted_Item_Class_Selector) ? i : []));

			if (allHighlightIndices.length > 1 && allHighlightIndices.includes(hoverIndex)) {
				return allHighlightIndices[0] === hoverIndex ? allHighlightIndices[1] : allHighlightIndices[0];
			}
			return allHighlightIndices[0] ?? -1;
		};
		const selectIndex = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));

		return selectIndex < 0 ? getHighlightIndex() : selectIndex;
	}

	_resultItemClasses(values) {
		this.#resultItemClasses = values;
		this.#resultItemSelector = `:is(${this.#resultItemClasses.map((i) => i.tag).join(',')})`;
	}

	set resultItemClasses(values) {
		this._resultItemClasses(values);
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
