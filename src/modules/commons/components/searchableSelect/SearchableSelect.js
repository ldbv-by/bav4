import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './searchableSelect.css';

const Update_Placeholder = 'update_placeholder';
const Update_Options = 'update_options';
const Update_AvailableOptions = 'update_availableOptions';
const Update_SelectedOption = 'update_selectedOption';

export class SearchableSelect extends MvuElement {
	constructor() {
		super({
			placeholder: 'Search...',
			options: [],
			availableOptions: [],
			selectedOption: null
		});
	}

	onInitialize() {
		document.addEventListener('click', () => this.#hideDropdown());
	}

	update(type, data, model) {
		switch (type) {
			case Update_Placeholder:
				return { ...model, label: data };
			case Update_SelectedOption:
				return { ...model, selectedOption: data };
			case Update_Options:
				return this.#updateOptionsFiltering({ ...model, options: data });
			case Update_AvailableOptions:
				return this.#updateOptionsFiltering(model, data);
		}
	}

	createView(model) {
		const { selectedOption, placeholder, availableOptions } = model;

		/*https://semantic-ui.com/modules/dropdown.html */

		const onSelectableItemChosen = (evt) => {
			// Prevents global click handler to trigger s. onInitialize()
			evt.stopPropagation();

			console.log(evt.target.value);
			this.#hideDropdown();
			this.signal(Update_SelectedOption, evt.target.value);
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
			this.signal(Update_AvailableOptions, evt.target.value);
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
						.value=${selectedOption}
						@click=${onSearchInputClicked}
						@input=${onSearchInputChange}
						@focus=${() => this.#showDropdown()}
					/>
					<div class="caret-fill-down"></div>
				</div>
				<div class="select-items-container hidden">
					${availableOptions.map((item) => html`<div class="option" .value=${item} @click=${onSelectableItemChosen}>${item}</div>`)}
				</div>
			</div>
		`;
	}

	#updateOptionsFiltering(model, searchTerm = '') {
		const options = model.options;
		searchTerm = searchTerm.toUpperCase();
		const filteredOptions = [];

		for (let option of options) {
			if (option.toUpperCase().indexOf(searchTerm) > -1) {
				filteredOptions.push(option);
			}
		}

		return { ...model, availableOptions: filteredOptions };
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

	set selected(value) {
		this.signal(Update_SelectedOption, value);
	}

	get selected() {
		return this.getModel().selectedOption;
	}

	set placeholder(value) {
		this.signal(Update_Placeholder, value);
	}

	set options(value) {
		this.signal(Update_Options, value);
	}

	static get tag() {
		return 'ba-searchable-select';
	}
}
