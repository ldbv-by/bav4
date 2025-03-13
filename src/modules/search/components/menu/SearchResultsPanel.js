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
import { MvuElement } from '../../../MvuElement';
import { findAllBySelector } from '../../../../utils/markup';

/**
 * Container for different types of search result panels.
 * @class
 * @author taulinger
 * @author costa_gi
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
		const items = findAllBySelector(this, '.ba-list-item');
		const indexOfFocusedItem = items.findIndex((element) => element.matches('.ba-list-item_hover'));
		this.#hoverIndex = -1;
		this._changeHoveredElement(items[indexOfFocusedItem], null);
	}

	_arrowDown() {
		const items = findAllBySelector(this, '.ba-list-item');
		const indexOfPreviousItem = items.findIndex((element) => element.matches('.ba-list-item_hover'));

		this.#hoverIndex = this.#hoverIndex === null ? (indexOfPreviousItem < 0 ? 0 : indexOfPreviousItem + 1) : this.#hoverIndex + 1;

		this._changeHoveredElement(items[indexOfPreviousItem], items[this.#hoverIndex]);
	}

	_arrowUp() {
		const items = findAllBySelector(this, '.ba-list-item');
		const indexOfPreviousItem = items.findIndex((element) => element.matches('.ba-list-item_hover'));

		this.#hoverIndex = this.#hoverIndex === null ? (indexOfPreviousItem < 0 ? indexOfPreviousItem : indexOfPreviousItem - 1) : this.#hoverIndex - 1;

		this._changeHoveredElement(items[indexOfPreviousItem], items[this.#hoverIndex]);
	}

	_changeHoveredElement(previous, nextItem) {
		if (previous) {
			previous.dispatchEvent(new Event('mouseleave'));
			previous.classList.remove('ba-list-item_hover');
		}
		if (nextItem) {
			nextItem.dispatchEvent(new Event('mouseenter'));
			nextItem.classList.add('ba-list-item_hover');
		}
	}

	_enter() {
		const items = findAllBySelector(this, '.ba-list-item');
		const indexOfSelectedItem = items.findIndex((element) => element.matches('.ba-list-item_hover'));

		const selectedItem = items[indexOfSelectedItem] ?? { click: () => {} };
		selectedItem.click();
	}

	static get tag() {
		return 'ba-search-results-panel';
	}
}
