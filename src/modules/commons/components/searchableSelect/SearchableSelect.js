/**
 * @module modules/commons/components/searchableSelect/SearchableSelect
 */

/* TODO:
 - Select Option with arrow key
 - Enter should behave like a select click
 - Esc should behave like a cancel action
 - Rework selected update (and datatype ???)
*/

import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './searchableSelect.css';
import { isNumber } from '../../../../utils/checks';

const Update_Placeholder = 'update_placeholder';
const Update_Options = 'update_options';
const Update_Selected = 'update_selected';
const Update_Search = 'update_search';

/**
 * General purpose implementation of a select-like component with integrated filtering.
 *
 * @property {string} placeholder='' - The placeholder to show when the search field is empty.
 * @property {string|null} selected=null - The currently selected option.
 * @property {string} search='' - The search term to filter through the provided options
 * @property {Array<String>} options - Unfiltered options the user can choose from
 * @property {function(changedState)} onChange - The Change callback function when the search input changes or an option is selected
 * @fires onChange Fires when the search input changes or an option is selected
 *
 * @class
 * @author herrmutig
 */
export class SearchableSelect extends MvuElement {
	#hasPointer = false;
	#cancelActionListener;

	// eslint-disable-next-line no-unused-vars
	#onChange = (changedState) => {};

	constructor() {
		super({
			placeholder: 'Search...',
			selected: null,
			search: '',
			options: [],
			availableOptions: []
		});

		this.#cancelActionListener = () => {
			if (this.#hasPointer) return;

			// Cancels Action
			this.#hideDropdown();

			if (!this.selected) {
				this.signal(Update_Search, '');
			}
		};
	}

	onInitialize() {
		document.addEventListener('click', this.#cancelActionListener);
	}

	onDisconnect() {
		document.removeEventListener('click', this.#cancelActionListener);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Placeholder:
				return { ...model, placeholder: data };
			case Update_Selected: {
				const selected = isNumber(data) ? model.availableOptions[Math.max(data, 0)] : data;
				return { ...model, selected: selected, search: selected };
			}
			case Update_Options:
				return this.#updateOptionsFiltering({ ...model, options: [...data] });
			case Update_Search:
				return this.#updateOptionsFiltering({ ...model, search: data, selected: null });
		}
	}

	onAfterRender(isInitial) {
		if (isInitial) return;

		const { selected, availableOptions } = this.getModel();
		const eventData = {
			availableOptions: availableOptions,
			selected: selected
		};

		this.dispatchEvent(
			new CustomEvent('change', {
				detail: eventData
			})
		);
		this.#onChange(eventData);
	}

	createView(model) {
		const { search, placeholder, availableOptions } = model;

		const onSelectableItemChosen = (evt) => {
			// Prevents global click handler to trigger s. onInitialize()
			evt.stopPropagation();
			this.#hideDropdown();
			this.signal(Update_Selected, evt.target.value);
		};

		const onSearchInputClicked = () => {
			this.#showDropdown();
		};

		const onPointerEnter = () => {
			this.#hasPointer = true;
		};

		const onPointerLeave = () => {
			this.#hasPointer = false;
		};

		const onSearchInputChange = (evt) => {
			this.#showDropdown();
			this.signal(Update_Search, evt.target.value);
		};

		return html`
			<style>
				${css}
			</style>

			<div class="searchable-select" @pointerenter=${onPointerEnter} @pointerleave=${onPointerLeave} @click=${onSearchInputClicked}>
				<div class="search-input-container">
					<input id="search-input" type="text" .placeholder=${placeholder} .value=${search} @input=${onSearchInputChange} />
					<div class="caret-fill-down"></div>
				</div>
				<div class="dropdown hidden">
					${availableOptions.map((item, index) => html`<div class="option" .value=${index} @click=${onSelectableItemChosen}>${item}</div>`)}
				</div>
			</div>
		`;
	}

	#updateOptionsFiltering(model) {
		const { search, options } = model;
		const ucSearchTerm = search.toUpperCase();
		const filteredOptions = [];

		for (const option of options) {
			if (option.toUpperCase().indexOf(ucSearchTerm) > -1) {
				filteredOptions.push(option);
			}
		}

		return { ...model, availableOptions: filteredOptions };
	}

	#hideDropdown() {
		const itemsContainer = this.shadowRoot.querySelector('.dropdown');
		itemsContainer.classList.remove('visible');
		itemsContainer.classList.add('hidden');
	}

	#showDropdown() {
		const itemsContainer = this.shadowRoot.querySelector('.dropdown');
		itemsContainer.classList.add('visible');
		itemsContainer.classList.remove('hidden');
	}

	get placeholder() {
		return this.getModel().placeholder;
	}

	set placeholder(value) {
		this.signal(Update_Placeholder, value);
	}

	get selected() {
		return this.getModel().selected;
	}

	set selected(value) {
		this.signal(Update_Selected, value);
	}

	get search() {
		return this.getModel().search;
	}

	set search(value) {
		this.signal(Update_Search, value);
	}

	get options() {
		return this.getModel().options;
	}

	set options(value) {
		this.signal(Update_Options, value);
	}

	set onChange(callback) {
		this.#onChange = callback;
	}

	get onChange() {
		return this.#onChange;
	}

	/**
	 * Returns true when a pointer entered the component. False when a pointer leaves the component.
	 * @readonly
	 */
	get hasPointer() {
		return this.#hasPointer;
	}

	static get tag() {
		return 'ba-searchable-select';
	}
}
