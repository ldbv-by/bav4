/**
 * @module modules/search/components/menu/SearchResultsPanel
 */
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LocationResultsPanel } from './types/location/LocationResultsPanel';
import { GeoResourceResultsPanel } from './types/geoResource/GeoResourceResultsPanel';
import { AbstractMvuContentPanel } from '../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { CpResultsPanel } from './types/cp/CpResultsPanel';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';
import { findAllBySelector, findClosest } from '../../../../utils/markup';
import { LocationResultItem } from './types/location/LocationResultItem';
import { GeoResourceResultItem } from './types/geoResource/GeoResourceResultItem';
import { focusSearchField } from '../../../../store/mainMenu/mainMenu.action';
import { CpResultItem } from './types/cp/CpResultItem';
import { Header } from '../../../header/components/Header';
import { MainMenu } from '../../../menu/components/mainMenu/MainMenu';
import { Selected_Item_Class, Highlight_Item_Class } from './AbstractResultItem';

export const Navigatable_Result_Item_Class = [LocationResultItem, GeoResourceResultItem, CpResultItem];

const Highlighted_Item_Class_Selector = `.${Highlight_Item_Class}`;
const Selected_Item_Class_Selector = `.${Selected_Item_Class}`;
const Hover_Selector = `:is(:hover)`;
const Search_Field_Index = -1;
const No_Op = () => {};

/**
 * Container for different types of search result panels.
 * @class
 * @property {Array<AbstractResultItem>} resultItemClasses The ResultItemClasses which are used to define the query selector for all navigatable ResultItems.
 * @author taulinger
 * @author costa_gi
 * @author thiloSchlemmer
 */
export class SearchResultsPanel extends AbstractMvuContentPanel {
	#keyActionMapper;
	#selectedIndex;
	#resultItemClasses;
	#resultItemSelector;

	constructor(keyActionMapper = new KeyActionMapper(document)) {
		super({});
		this.#keyActionMapper = keyActionMapper;

		this.#selectedIndex = null;
		this.#resultItemClasses = Navigatable_Result_Item_Class;
		this.#resultItemSelector = `:is(${this.#resultItemClasses.map((i) => i.tag).join(',')})`;
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

	/**
	 *
	 */
	createView() {
		return html`
			<div class="search-results-panel">
				${unsafeHTML(`<${LocationResultsPanel.tag}/>`)} ${unsafeHTML(`<${GeoResourceResultsPanel.tag}/>`)} ${unsafeHTML(`<${CpResultsPanel.tag}/>`)}
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

	set resultItemClasses(values) {
		this.#resultItemClasses = values;
		this.#resultItemSelector = `:is(${this.#resultItemClasses.map((i) => i.tag).join(',')})`;
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
