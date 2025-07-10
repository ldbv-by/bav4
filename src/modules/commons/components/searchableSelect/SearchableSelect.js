/**
 * @module modules/commons/components/searchableSelect/SearchableSelect
 */

import css from './searchableSelect.css';
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { isNumber } from '../../../../utils/checks';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';

const Update_Placeholder = 'update_placeholder';
const Update_Options = 'update_options';
const Update_Selected = 'update_selected';
const Update_Search = 'update_search';
const Update_Max_Entries = 'update_max_entries';
const Update_Show_Caret = 'update_show_caret';
const Update_Dropdown_Header = 'update_dropdown_header';

/**
 * General purpose implementation of a select-like component with integrated filtering.
 *
 * @property {boolean} allowFreeText=false - True: The user can write any text in the field. False: The user can only choose from the options available.
 * @property {string} dropdownHeader=null - The dropdownHeader to show when the dropdown opens (null hides the header).
 * @property {string} placeholder='' - The placeholder to show when the search field is empty.
 * @property {number} maxEntries=10 - The maximum amount of entries to show in the select field.
 * @property {string|null} selected=null - The currently selected option.
 * @property {string} search='' - The search term to filter through the provided options
 * @property {boolean} showCaret=true - Shows a caret on the search field
 * @property {Array<String>} options - Unfiltered options the user can choose from
 * @property {function(changedState)} onChange - The Change callback function when the search input changes
 * @property {function(selectedState)} onSelect - The Selected callback function when the user chose an option from the dropdown
 * @fires change Fires when the search input changes
 * @fires select Fires when the selected value changes
 *
 * @class
 * @author herrmutig
 */
export class SearchableSelect extends MvuElement {
	#hasPointer;
	#keyActionMapper;
	#allowFreeText;

	#onPointerCancelActionListener = () => {
		if (this.#hasPointer) return;
		this.#cancelAction();
	};

	// eslint-disable-next-line no-unused-vars
	#onChange = (changedState) => {};
	// eslint-disable-next-line no-unused-vars
	#onSelect = (selectState) => {};

	constructor() {
		super({
			placeholder: 'Search...',
			maxEntries: 10,
			selected: null,
			search: '',
			options: [],
			filteredOptions: [],
			showCaret: true,
			dropdownHeader: null
		});

		this.#keyActionMapper = new KeyActionMapper(document);
		this.#hasPointer = false;
		this.#allowFreeText = false;
	}

	onInitialize() {
		this.observeModel('search', () => this.#dispatchChangeEvents());
		this.observeModel('selected', () => this.#dispatchSelectEvents());
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			this._setInputWidth();
		}
	}

	/**
	 * sets the width of the input field using the dropdown width
	 */
	_setInputWidth() {
		const dropdown = this.shadowRoot.querySelector('.dropdown');
		const input = this.shadowRoot.querySelector('#search-input');
		const dropdownRect = dropdown.getBoundingClientRect();
		input.style.width = dropdownRect.width + 'px';
		dropdown.style.minWidth = dropdownRect.width + 'px';
	}

	onDisconnect() {
		document.removeEventListener('click', this.#onPointerCancelActionListener);
		this.#keyActionMapper.deactivate();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Dropdown_Header:
				return { ...model, dropdownHeader: data };
			case Update_Placeholder:
				return { ...model, placeholder: data };
			case Update_Selected: {
				const selected = isNumber(data) ? model.filteredOptions[Math.max(data, 0)] : data;
				return this._updateOptionsFiltering({ ...model, selected: selected, search: selected });
			}
			case Update_Options:
				return this._updateOptionsFiltering({ ...model, options: [...data] });
			case Update_Search:
				return this._updateOptionsFiltering({ ...model, search: data ?? '' });
			case Update_Max_Entries:
				return { ...model, maxEntries: data };
			case Update_Show_Caret:
				return { ...model, showCaret: data };
		}
	}

	createView(model) {
		const { search, showCaret, placeholder, filteredOptions, maxEntries, dropdownHeader } = model;

		const onSearchInputClicked = () => {
			this._showDropdown(document.documentElement.clientHeight);
		};

		const onSearchInputTogglerClicked = (evt) => {
			evt.stopPropagation();

			const isDropdownVisible = this.shadowRoot.querySelector('.dropdown.visible') !== null;
			if (isDropdownVisible) {
				this.#cancelAction();
			} else {
				this._showDropdown(document.documentElement.clientHeight);
			}
		};

		const onPointerEnter = () => {
			this.#hasPointer = true;
		};

		const onPointerLeave = () => {
			this.#hasPointer = false;
		};

		const onSearchInputChange = (evt) => {
			this.signal(Update_Search, evt.currentTarget.value);
			this._showDropdown(document.documentElement.clientHeight);
		};

		const onPointerEnterOption = (evt) => {
			this.#hoverOption(evt.currentTarget);
		};

		const onPointerLeaveOption = (evt) => {
			evt.currentTarget.classList.remove('hovered');
		};

		const onOptionChosen = (evt) => {
			// Prevents global click handler to trigger s. onInitialize()
			evt.stopPropagation();
			this.#hoverOption(evt.currentTarget);
			this.#confirmAction();
		};

		return html`
			<style>
				${css}
			</style>
			<div class="searchable-select" @pointerenter=${onPointerEnter} @pointerleave=${onPointerLeave} @click=${onSearchInputClicked}>
				<div class="search-input-container">
					<input id="search-input" type="text" autocomplete="off" .placeholder=${placeholder} .value=${search} @input=${onSearchInputChange} />
					${showCaret
						? html`<div id="search-input-toggler" @click=${onSearchInputTogglerClicked}>
								<span class="caret-fill-down"></span>
							</div> `
						: nothing}
				</div>

				<div class="dropdown hidden">
					${dropdownHeader !== null ? html`<div class="dropdown-header">${dropdownHeader}</div>` : nothing}

					<div class="dropdown-content">
						${filteredOptions.slice(0, maxEntries).map(
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
			</div>
		`;
	}

	#hoverOption(target) {
		// Due to keyboard events, multiple options can be hovered. The following line prevents it.
		this.shadowRoot.querySelectorAll('.option.hovered').forEach((option) => option.classList.remove('hovered'));
		target.classList.add('hovered');
	}

	_updateOptionsFiltering(model) {
		const options = model.options;
		const search = model.search ?? '';
		const ucSearch = search.toUpperCase();

		const matchingOptions = [];

		for (const option of options) {
			if (option.toUpperCase().indexOf(ucSearch) > -1) {
				matchingOptions.push(option);
			}
		}
		return { ...model, filteredOptions: matchingOptions, search: search };
	}

	#hideDropdown() {
		const dropdown = this.shadowRoot.querySelector('.dropdown');
		dropdown.classList.remove('visible');
		dropdown.classList.add('hidden');

		this.#keyActionMapper.deactivate();
		document.removeEventListener('click', this.#onPointerCancelActionListener);
	}

	_showDropdown(viewportHeight) {
		const dropdown = this.shadowRoot.querySelector('.dropdown');
		const dropdownAncestor = this.shadowRoot.querySelector('.searchable-select');
		const dropdownAncestorRect = dropdownAncestor.getBoundingClientRect();

		dropdown.classList.add('visible');
		dropdown.classList.remove('hidden');

		// Calculate foldout direction of dropdown
		const foldoutUpwards = 0 > viewportHeight - (dropdown.clientHeight + dropdownAncestorRect.y + dropdownAncestorRect.height);
		const dropdownOffset = dropdownAncestorRect.height + 'px';

		if (foldoutUpwards) {
			dropdown.style.marginBottom = dropdownOffset;
			dropdown.style.removeProperty('margin-top');
			dropdownAncestor.classList.add('fold-up');
		} else {
			dropdown.style.marginTop = dropdownOffset;
			dropdown.style.removeProperty('margin-bottom');
			dropdownAncestor.classList.remove('fold-up');
		}

		// Duplicate event safety
		document.removeEventListener('click', this.#onPointerCancelActionListener);
		this.#keyActionMapper.deactivate();
		this.#keyActionMapper
			.addForKeyUp('Escape', () => this.#cancelAction())
			.addForKeyUp('Enter', () => this.#confirmAction())
			.addForKeyUp('ArrowUp', () => this._hoverNextOption(true))
			.addForKeyUp('ArrowDown', () => this._hoverNextOption());

		this.#keyActionMapper.activate();
		document.addEventListener('click', this.#onPointerCancelActionListener);
		Array.from(this.shadowRoot.querySelectorAll('.option')).forEach((el) => el.classList.remove('hovered'));
	}

	#cancelAction() {
		this.#hideDropdown();

		if (this.#allowFreeText) {
			this.signal(Update_Selected, this.search);
		} else {
			this.signal(Update_Search, this.selected);
		}
	}

	#confirmAction() {
		const hoveredOption = this.shadowRoot.querySelector('.option.hovered');

		if (!hoveredOption) {
			if (this.#allowFreeText) {
				this.signal(Update_Selected, this.search);
			} else {
				// If no option found it should reset search to last selected.
				this.signal(Update_Search, this.selected);
			}
		} else {
			// @ts-ignore
			this.signal(Update_Selected, hoveredOption.value);
		}

		this.#hideDropdown();
	}

	#dispatchChangeEvents() {
		const { filteredOptions } = this.getModel();
		const eventData = {
			filteredOptions: filteredOptions
		};

		this.dispatchEvent(
			new CustomEvent('change', {
				detail: eventData
			})
		);

		this.#onChange(eventData);
	}

	#dispatchSelectEvents() {
		const { selected } = this.getModel();

		const eventData = {
			selected: selected
		};

		this.dispatchEvent(
			new CustomEvent('select', {
				detail: eventData
			})
		);

		this.#onSelect(eventData);
	}

	_hoverNextOption(invert = false) {
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

	get allowFreeText() {
		return this.#allowFreeText;
	}

	set allowFreeText(value) {
		this.#allowFreeText = value === true;
	}

	get dropdownHeader() {
		return this.getModel().dropdownHeader;
	}

	set dropdownHeader(value) {
		this.signal(Update_Dropdown_Header, value);
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
		this.signal(Update_Max_Entries, value);
	}

	set onChange(callback) {
		this.#onChange = callback;
	}

	set onSelect(callback) {
		this.#onSelect = callback;
	}

	set showCaret(value) {
		this.signal(Update_Show_Caret, value === true);
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
