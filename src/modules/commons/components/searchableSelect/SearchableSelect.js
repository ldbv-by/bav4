/**
 * @module modules/commons/components/searchableSelect/SearchableSelect
 */

import css from './searchableSelect.css';
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { isNumber } from '../../../../utils/checks';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';

const Update_Placeholder = 'update_placeholder';
const Update_Options = 'update_options';
const Update_Selected = 'update_selected';
const Update_Search = 'update_search';
const Update_MaxEntries = 'update_maxEntries';

/**
 * General purpose implementation of a select-like component with integrated filtering.
 *
 * @property {string} placeholder='' - The placeholder to show when the search field is empty.
 * @property {number} maxEntries=10 - The maximum amount of entries to show in the select field.
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
	#hasPointer;
	#keyActionMapper;

	#onPointerCancelActionListener = () => {
		if (this.#hasPointer) return;
		this.#cancelAction();
	};

	// eslint-disable-next-line no-unused-vars
	#onChange = (changedState) => {};

	constructor() {
		super({
			placeholder: 'Search...',
			maxEntries: 10,
			selected: null,
			search: '',
			options: [],
			availableOptions: []
		});

		this.#hasPointer = false;
	}

	onInitialize() {
		document.addEventListener('click', this.#onPointerCancelActionListener);

		this.#keyActionMapper = new KeyActionMapper(document);
		this.#keyActionMapper.deactivate();

		this.observeModel(['selected', 'search'], () => this.#dispatchChangeEvents());
	}

	onDisconnect() {
		document.removeEventListener('click', this.#onPointerCancelActionListener);
		this.#keyActionMapper.deactivate();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Placeholder:
				return { ...model, placeholder: data };
			case Update_Selected: {
				const selected = isNumber(data) ? model.availableOptions[Math.max(data, 0)] : data;
				return this.#updateOptionsFiltering({ ...model, selected: selected, search: selected });
			}
			case Update_Options:
				return this.#updateOptionsFiltering({ ...model, options: [...data] });
			case Update_Search:
				return this.#updateOptionsFiltering({ ...model, search: data, selected: null });
			case Update_MaxEntries:
				return { ...model, maxEntries: data };
		}
	}

	createView(model) {
		const { search, placeholder, availableOptions, maxEntries } = model;

		const onSearchInputClicked = () => {
			this.#showDropdown();
		};

		const onSearchInputTogglerClicked = (evt) => {
			evt.stopPropagation();

			const isDropdownVisible = this.shadowRoot.querySelector('.dropdown.visible') !== null;
			if (isDropdownVisible) {
				this.#cancelAction();
			} else {
				this.#showDropdown();
			}
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

		const onPointerEnterOption = (evt) => {
			this.#hoverOption(evt.target);
		};

		const onPointerLeaveOption = (evt) => {
			evt.target.classList.remove('hovered');
		};

		const onOptionChosen = (evt) => {
			// Prevents global click handler to trigger s. onInitialize()
			evt.stopPropagation();
			this.#hoverOption(evt.target);
			this.#confirmAction();
		};

		return html`
			<style>
				${css}
			</style>

			<div class="searchable-select" @pointerenter=${onPointerEnter} @pointerleave=${onPointerLeave} @click=${onSearchInputClicked}>
				<div class="search-input-container">
					<input id="search-input" type="text" .placeholder=${placeholder} .value=${search} @input=${onSearchInputChange} />
					<div id="search-input-toggler" @click=${onSearchInputTogglerClicked}>
						<span class="caret-fill-down"></span>
					</div>
				</div>
				<div class="dropdown hidden">
					${availableOptions.slice(0, maxEntries).map(
						(item, index) =>
							html`<div
								class="option"
								@click=${onOptionChosen}
								@pointerenter=${onPointerEnterOption}
								@pointerleave=${onPointerLeaveOption}
								.value=${index}
							>
								<span>${item}</span>
							</div>`
					)}
				</div>
			</div>
		`;
	}

	#hoverOption(target) {
		// Due to keyboard events, multiple options can be hovered. The following line prevents it.
		this.shadowRoot.querySelectorAll('.option.hovered').forEach((option) => option.classList.remove('hovered'));
		target.classList.add('hovered');
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

		this.#keyActionMapper.deactivate();
	}

	#showDropdown() {
		const itemsContainer = this.shadowRoot.querySelector('.dropdown');
		itemsContainer.classList.add('visible');
		itemsContainer.classList.remove('hidden');

		// Duplicate event safety
		this.#keyActionMapper.deactivate();
		this.#keyActionMapper
			.addForKeyUp('Escape', () => this.#cancelAction())
			.addForKeyUp('Enter', () => this.#confirmAction())
			.addForKeyUp('ArrowUp', () => this._chooseNextOption(true))
			.addForKeyUp('ArrowDown', () => this._chooseNextOption());

		this.#keyActionMapper.activate();
	}

	#cancelAction() {
		this.#hideDropdown();

		if (!this.selected) {
			this.signal(Update_Search, '');
		}
	}

	#confirmAction() {
		const hoveredOption = this.shadowRoot.querySelector('.option.hovered');
		if (!hoveredOption) return;

		this.#hideDropdown();
		// @ts-ignore
		this.signal(Update_Selected, hoveredOption.value);
	}

	#dispatchChangeEvents() {
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

	_chooseNextOption(invert = false) {
		const options = Array.from(this.shadowRoot.querySelectorAll('.option'));
		const hoveredOption = this.shadowRoot.querySelector('.option.hovered');
		let nextHoveredOptionIndex = 0;

		if (options.length < 1) return;

		if (hoveredOption) {
			const hoveredOptionIndex = options.indexOf(hoveredOption);
			const previous = () => (hoveredOptionIndex > 0 ? hoveredOptionIndex - 1 : options.length - 1);
			const next = () => (hoveredOptionIndex < options.length - 1 ? hoveredOptionIndex + 1 : 0);

			hoveredOption.classList.remove('hovered');
			nextHoveredOptionIndex = invert ? previous() : next();
		}

		options[nextHoveredOptionIndex].classList.add('hovered');
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
		if (value === null || value === undefined) value = [];

		this.signal(Update_Options, value);
	}

	get maxEntries() {
		return this.getModel().maxEntries;
	}

	set maxEntries(value) {
		this.signal(Update_MaxEntries, value);
	}

	set onChange(callback) {
		this.#onChange = callback;
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
