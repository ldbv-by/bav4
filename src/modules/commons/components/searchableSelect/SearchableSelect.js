// TODO: Select Option with arrow key
// TODO: Enter should behave like a select click
// TODO: Esc should behave like a cancel action
// TODO Rework selected update (and datatype ???)

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
 * @property {string} placeholder='' - The placeholder to show when search field is empty.
 * @property {Array<String>} options=[] - Unfiltered options the user can choose from
 * @property {string|null} selected=null - The currently selected option.
 * @property {string} search='' - The search term to filter through the provided options
 *
 * @fires onChange Fires every time the user changed it's search or selects an option
 *
 * @class
 * @author herrmutig
 */
export class SearchableSelect extends MvuElement {
	#availableOptions = [];
	#onChange = (data) => {};

	constructor() {
		super({
			placeholder: 'Search...',
			selected: null,
			search: '',
			options: []
		});
	}

	onInitialize() {
		document.addEventListener('click', () => {
			// Cancel Action
			this.#hideDropdown();
			if (!this.selected) {
				this.signal(Update_Search, '');
			}
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Placeholder:
				return { ...model, placeholder: data };
			case Update_Selected:
				let selected;
				if (isNumber(data)) {
					selected = isNumber(data) ? this.#availableOptions[Math.max(data, 0)] : null;
				} else {
					selected = data;
				}

				return { ...model, selected: selected, search: selected };
			case Update_Options:
				return this.#updateOptionsFiltering({ ...model, options: [...data] });
			case Update_Search:
				return this.#updateOptionsFiltering({ ...model, search: data, selected: null });
		}
	}

	onAfterRender(isInitial) {
		if (isInitial) return;

		const model = this.getModel();
		const eventData = {
			availableOptions: this.#availableOptions,
			selected: model.selected
		};

		this.dispatchEvent(
			new CustomEvent('change', {
				detail: eventData
			})
		);
		this.#onChange(eventData);
	}

	createView(model) {
		const { search, placeholder } = model;
		const availableOptions = this.#availableOptions;

		const onSelectableItemChosen = (evt) => {
			// Prevents global click handler to trigger s. onInitialize()
			evt.stopPropagation();
			this.#hideDropdown();
			this.signal(Update_Selected, evt.target.value);
		};

		const onSearchInputClicked = (evt) => {
			evt.stopPropagation();
			const searchInput = this.shadowRoot.getElementById('search-input');

			if (searchInput !== evt.target) {
				searchInput.focus();
			}
		};

		const onSearchInputChange = (evt) => {
			this.#showDropdown();
			this.signal(Update_Search, evt.target.value);
		};

		return html`
			<style>
				${css}
			</style>

			<div class="searchable-select" @click=${onSearchInputClicked}>
				<div class="search-input-container">
					<input
						id="search-input"
						type="text"
						.placeholder=${placeholder}
						.value=${search}
						@click=${onSearchInputClicked}
						@input=${onSearchInputChange}
						@focus=${() => this.#showDropdown()}
					/>
					<div class="caret-fill-down"></div>
				</div>
				<div class="select-items-container hidden">
					${availableOptions.map((item, index) => html`<div class="option" .value=${index} @click=${onSelectableItemChosen}>${item}</div>`)}
				</div>
			</div>
		`;
	}

	#updateOptionsFiltering(model) {
		const { search, options } = model;
		const ucSearchTerm = search.toUpperCase();
		const filteredOptions = [];

		for (let option of options) {
			if (option.toUpperCase().indexOf(ucSearchTerm) > -1) {
				filteredOptions.push(option);
			}
		}

		this.#availableOptions = filteredOptions;
		return { ...model };
	}

	#hideDropdown() {
		if (this.shadowRoot) {
			const itemsContainer = this.shadowRoot.querySelector('.select-items-container');
			itemsContainer.classList.remove('visible');
			itemsContainer.classList.add('hidden');
		}
	}

	#showDropdown() {
		if (this.shadowRoot) {
			const itemsContainer = this.shadowRoot.querySelector('.select-items-container');
			itemsContainer.classList.add('visible');
			itemsContainer.classList.remove('hidden');
		}
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

	static get tag() {
		return 'ba-searchable-select';
	}
}
