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
import { findAllBySelector } from '../../../../utils/markup';
import { AbstractResultItem } from './AbstractSearchResultItem';
import { LocationResultItem } from './types/location/LocationResultItem';
import { GeoResourceResultItem } from './types/geoResource/GeoResourceResultItem';
import { CpResultItem } from './types/cp/CpResultItem';

const Navigatable_Result_Items = [LocationResultItem, GeoResourceResultItem, CpResultItem];
const ResultItem_Selector = `:is(${Navigatable_Result_Items.map((i) => i.tag).join(',')})`;

const Selected_Item_Class = 'ba-key-nav-item_select';
const Selected_Item_Class_Selector = `.${Selected_Item_Class}`;

/**
 * Container for different types of search result panels.
 * @class
 * @author taulinger
 * @author costa_gi
 * @author thiloSchlemmer
 */
export class SearchResultsPanel extends AbstractMvuContentPanel {
	#keyActionMapper = new KeyActionMapper(document)
		.addForKeyUp('ArrowDown', () => this._arrowDown())
		.addForKeyUp('ArrowUp', () => this._arrowUp())
		.addForKeyUp('Enter', () => this._enter());
	#selectedIndex = null;

	/**
	 * @override
	 */
	onInitialize() {
		this.#keyActionMapper.activate();
	}

	/**
	 *
	 */
	createView() {
		const onMouseEnter = () => {
			this._reset();
			this.#keyActionMapper.deactivate();
		};
		const onMouseLeave = () => this.#keyActionMapper.activate();
		return html`
			<div class="search-results-panel" @mouseenter=${() => onMouseEnter()} @mouseleave=${() => onMouseLeave()}>
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
		const items = findAllBySelector(this, ResultItem_Selector);
		const indexOfSelectedItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));
		this.#selectedIndex = -1;
		this._changeSelectedElement(items[indexOfSelectedItem], null);
	}

	_arrowDown() {
		const items = findAllBySelector(this, ResultItem_Selector);
		const indexOfPreviousItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));

		const nextIndex = this.#selectedIndex === null ? (indexOfPreviousItem < 0 ? 0 : indexOfPreviousItem + 1) : this.#selectedIndex + 1;
		this.#selectedIndex = nextIndex < items.length ? nextIndex : indexOfPreviousItem;
		this._changeSelectedElement(items[indexOfPreviousItem], items[this.#selectedIndex]);
	}

	_arrowUp() {
		const items = findAllBySelector(this, ResultItem_Selector);
		const indexOfPreviousItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));

		const nextIndex =
			this.#selectedIndex === null ? (indexOfPreviousItem < 0 ? indexOfPreviousItem : indexOfPreviousItem - 1) : this.#selectedIndex - 1;
		this.#selectedIndex = nextIndex < 0 ? indexOfPreviousItem : nextIndex;

		this._changeSelectedElement(items[indexOfPreviousItem], items[this.#selectedIndex]);
	}

	_enter() {
		const items = findAllBySelector(this, ResultItem_Selector);
		const indexOfSelectedItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));

		const selectedItem = items[indexOfSelectedItem] ?? null;
		if (selectedItem && selectedItem instanceof AbstractResultItem) {
			selectedItem.selectResult();
		}
	}

	_changeSelectedElement(previous, next) {
		if (previous === next) {
			return;
		}
		if (previous) {
			previous.classList.remove(Selected_Item_Class);
			if (previous instanceof AbstractResultItem) {
				previous.highlightResult(false);
			}
		}
		if (next) {
			next.classList.add(Selected_Item_Class);
			if (next instanceof AbstractResultItem) {
				next.highlightResult(true);
			}
		}
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
