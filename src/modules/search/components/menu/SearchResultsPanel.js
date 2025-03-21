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
import { LocationResultItem } from './types/location/LocationResultItem';
import { GeoResourceResultItem } from './types/geoResource/GeoResourceResultItem';

export const Navigatable_Result_Item_Class = [LocationResultItem, GeoResourceResultItem]; // TODO: CpResultItem currently excluded, waiting for other PR updates

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
	#resultItemClasses = Navigatable_Result_Item_Class;
	#resultItemSelector = `:is(${this.#resultItemClasses.map((i) => i.tag).join(',')})`;

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
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfSelectedItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));
		this.#selectedIndex = -1;
		this._changeSelectedElement(items[indexOfSelectedItem], null);
	}

	_arrowDown() {
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfPreviousItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));
		const nextIndex = this.#selectedIndex === null ? (indexOfPreviousItem < 0 ? 0 : indexOfPreviousItem + 1) : this.#selectedIndex + 1;
		this.#selectedIndex = nextIndex < items.length ? nextIndex : indexOfPreviousItem;
		this._changeSelectedElement(items[indexOfPreviousItem], items[this.#selectedIndex]);
	}

	_arrowUp() {
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfPreviousItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));

		const nextIndex =
			this.#selectedIndex === null ? (indexOfPreviousItem < 0 ? indexOfPreviousItem : indexOfPreviousItem - 1) : this.#selectedIndex - 1;
		this.#selectedIndex = nextIndex < 0 ? indexOfPreviousItem : nextIndex;

		this._changeSelectedElement(items[indexOfPreviousItem], items[this.#selectedIndex]);
	}

	_enter() {
		const items = findAllBySelector(this, this.#resultItemSelector);
		const indexOfSelectedItem = items.findIndex((element) => element.matches(Selected_Item_Class_Selector));

		const selectedItem = items[indexOfSelectedItem] ?? null;
		if (selectedItem) {
			selectedItem.selectResult();
		}
	}

	_changeSelectedElement(previous, next) {
		if (previous === next) {
			return;
		}
		if (previous) {
			previous.classList.remove(Selected_Item_Class);
			previous.highlightResult(false);
		}
		if (next) {
			next.classList.add(Selected_Item_Class);
			next.highlightResult(true);
		}
	}

	set ResultItemClasses(values) {
		if (Array.isArray(values)) {
			this.#resultItemClasses = values;
			this.#resultItemSelector = `:is(${this.#resultItemClasses.map((i) => i.tag).join(',')})`;
		}
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
