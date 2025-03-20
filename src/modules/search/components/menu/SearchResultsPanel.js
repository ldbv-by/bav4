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
	#hoverIndex = null;

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
		const items = findAllBySelector(this, '.ba-key-nav-item');
		const indexOfFocusedItem = items.findIndex((element) => element.matches('.ba-key-nav-item_select'));
		this.#hoverIndex = -1;
		this._changeHoveredElement(items[indexOfFocusedItem], null);
	}

	_arrowDown() {
		const items = findAllBySelector(this, '.ba-key-nav-item');
		const indexOfPreviousItem = items.findIndex((element) => element.matches('.ba-key-nav-item_select'));

		this.#hoverIndex = this.#hoverIndex === null ? (indexOfPreviousItem < 0 ? 0 : indexOfPreviousItem + 1) : this.#hoverIndex + 1;

		this._changeHoveredElement(items[indexOfPreviousItem], items[this.#hoverIndex]);
	}

	_arrowUp() {
		const items = findAllBySelector(this, '.ba-key-nav-item');
		const indexOfPreviousItem = items.findIndex((element) => element.matches('.ba-key-nav-item_select'));

		this.#hoverIndex = this.#hoverIndex === null ? (indexOfPreviousItem < 0 ? indexOfPreviousItem : indexOfPreviousItem - 1) : this.#hoverIndex - 1;

		this._changeHoveredElement(items[indexOfPreviousItem], items[this.#hoverIndex]);
	}

	_changeHoveredElement(previous, nextItem) {
		if (previous) {
			previous.blur();
			previous.classList.remove('ba-key-nav-item_select');
		}
		if (nextItem) {
			nextItem.focus();
			nextItem.classList.add('ba-key-nav-item_select');
		}
	}

	_enter() {
		const items = findAllBySelector(this, '.ba-key-nav-item');
		const indexOfSelectedItem = items.findIndex((element) => element.matches('.ba-key-nav-item_select'));

		const selectedItem = items[indexOfSelectedItem] ?? { click: () => {} };
		const optionalActionItems = findAllBySelector(selectedItem, '.ba-key-nav-action');
		if (optionalActionItems.length > 0) {
			optionalActionItems[0].click();
		} else {
			selectedItem.click();
		}
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
