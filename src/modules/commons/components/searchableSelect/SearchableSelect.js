/**
 * @module modules/commons/components/searchableSelect/SearchableSelect
 */

import css from './searchableSelect.css';
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';

const Update_Placeholder = 'update_placeholder';
const Update_Options = 'update_options';
const Update_Selected = 'update_selected';
const Update_Search = 'update_search';
const Update_Max_Entries = 'update_max_entries';
const Update_Show_Caret = 'update_show_caret';
const Update_Is_Responsive = 'update_is_responsive';
const Update_Dropdown_Header = 'update_dropdown_header';

/**
 * General purpose implementation of a select-like component with integrated filtering.
 *
 * @property {number} maxEntries=10 - The maximum amount of entries to show in the select field.
 * @property {string} dropdownHeader=null - The dropdownHeader to show when the dropdown opens (null hides the header).
 * @property {string} placeholder='' - The placeholder to show when the search field is empty.
 * @property {string} search='' - The search term to filter through the provided options
 * @property {string|null} selected=null - The currently selected option.
 * @property {string|null} pattern=null - The regex-pattern to validate the search input against. If null, no validation is applied.
 * @property {boolean} showCaret=true - Shows a caret on the search field
 * @property {boolean} isResponsive=false - The Select adjusts to the width of your container.
 * @property {Array<String>} options - Unfiltered options the user can choose from
 * @property {function(changedState)} onChange - The Change callback function when the search input changes
 * @property {function(selectedState)} onSelect - The Selected callback function when the user chose an option from the dropdown
 *
 * @fires change Fires when the search input changes
 * @fires select Fires when the selected value changes
 *
 * @class
 * @author herrmutig
 */
export class SearchableSelect extends MvuElement {
	#filteredOptions;
	#keyActionMapper;
	#hasPointer;
	#allowFreeText;
	#allowFiltering;
	#pattern;

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
			maxEntries: 10,
			dropdownHeader: null,
			placeholder: 'Search...',
			search: '',
			selected: null,
			options: [],
			showCaret: true,
			isResponsive: false
		});

		this.#filteredOptions = [];
		this.#keyActionMapper = new KeyActionMapper(document);
		this.#hasPointer = false;
		this.#allowFreeText = false;
		this.#allowFiltering = true;
	}

	onInitialize() {
		this.observeModel('search', () => this.#dispatchChangeEvents());
		this.observeModel('selected', () => this.#dispatchSelectEvents());
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		const { isResponsive } = this.getModel();
		if (firstTime && !isResponsive) {
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
				return { ...model, selected: data };
			}
			case Update_Options:
				return this._updateOptionsFiltering({ ...model, options: [...data] });
			case Update_Search:
				return this._updateOptionsFiltering({ ...model, search: data ?? '' });
			case Update_Max_Entries:
				return { ...model, maxEntries: data };
			case Update_Show_Caret:
				return { ...model, showCaret: data };
			case Update_Is_Responsive:
				return { ...model, isResponsive: data };
		}
	}

	createView(model) {
		const { search, showCaret, placeholder, maxEntries, dropdownHeader, isResponsive } = model;

		const onSearchInputClicked = () => {
			this._showDropdown(document.documentElement.clientHeight, isResponsive);
		};

		const onSearchInputTogglerClicked = (evt) => {
			evt.stopPropagation();

			const isDropdownVisible = this.shadowRoot.querySelector('.dropdown.visible') !== null;
			if (isDropdownVisible) {
				this.#cancelAction();
			} else {
				this._showDropdown(document.documentElement.clientHeight, isResponsive);
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
			this._showDropdown(document.documentElement.clientHeight, isResponsive);
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

		const getHostStyle = () => {
			return isResponsive
				? html` :host { width: 100%; } `
				: html` :host { --searchable-select-min-width: 7em; --searchable-select-max-with: 20em; } `;
		};

		return html`
			<style>
				${getHostStyle()}
				${css}
			</style>
			<div class="searchable-select" @pointerenter=${onPointerEnter} @pointerleave=${onPointerLeave} @click=${onSearchInputClicked}>
				<div class="search-input-container">
					<input
						id="search-input"
						type="text"
						autocomplete="off"
						pattern=${this.#pattern ?? nothing}
						placeholder=${placeholder}
						.value=${search}
						@input=${onSearchInputChange}
					/>
					${showCaret
						? html`<div id="search-input-toggler" @click=${onSearchInputTogglerClicked}>
								<span class="caret-fill-down"></span>
							</div> `
						: nothing}
				</div>

				<div class="dropdown hidden">
					${dropdownHeader !== null ? html`<div class="dropdown-header">${dropdownHeader}</div>` : nothing}

					<div class="dropdown-content">
						${this.#filteredOptions.slice(0, maxEntries).map(
							(item) =>
								html`<div
									class="option"
									@click=${onOptionChosen}
									@pointerenter=${onPointerEnterOption}
									@pointerleave=${onPointerLeaveOption}
									.value=${item}
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

	#hideDropdown() {
		const dropdown = this.shadowRoot.querySelector('.dropdown');
		dropdown.classList.remove('visible');
		dropdown.classList.add('hidden');

		this.#keyActionMapper.deactivate();
		document.removeEventListener('click', this.#onPointerCancelActionListener);
	}

	#cancelAction() {
		this.#hideDropdown();

		if (this.#allowFreeText) {
			this.signal(Update_Search, this.search);
			this.signal(Update_Selected, this.search);
		} else {
			this.signal(Update_Search, this.selected);
		}
	}

	#confirmAction() {
		const hoveredOption = this.shadowRoot.querySelector('.option.hovered');

		if (!hoveredOption) {
			if (this.#allowFreeText) {
				this.signal(Update_Search, this.search);
				this.signal(Update_Selected, this.search);
			} else {
				const firstOptionFinding = this._filterFirstOption(this.search);
				this.signal(Update_Search, firstOptionFinding);
				this.signal(Update_Selected, firstOptionFinding);
			}
		} else {
			// @ts-ignore
			const hoveredOptionValue = hoveredOption.value;
			this.signal(Update_Search, hoveredOptionValue);
			this.signal(Update_Selected, hoveredOptionValue);
		}

		this.#hideDropdown();
	}

	#dispatchChangeEvents() {
		const eventData = {
			filteredOptions: [...this.#filteredOptions]
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

	_filterFirstOption(value) {
		const ucSearch = value.toUpperCase();
		return this.options.find((opt) => opt.toUpperCase().indexOf(ucSearch) > -1) ?? '';
	}

	_updateOptionsFiltering(model) {
		const search = model.search ?? '';

		if (this.allowFiltering) {
			const options = model.options;
			const ucSearch = search.toUpperCase();
			const matchingOptions = [];

			for (const option of options) {
				if (option.toUpperCase().indexOf(ucSearch) > -1) {
					matchingOptions.push(option);
				}
			}

			this.#filteredOptions = matchingOptions;
		}

		return { ...model, search: search };
	}

	_showDropdown(viewportHeight, isResponsive) {
		const dropdown = this.shadowRoot.querySelector('.dropdown');
		const dropdownAncestor = this.shadowRoot.querySelector('.searchable-select');
		const dropdownAncestorRect = dropdownAncestor.getBoundingClientRect();

		dropdown.classList.add('visible');
		dropdown.classList.remove('hidden');
		if (isResponsive) {
			dropdown.style.width = dropdownAncestorRect.width + 'px';
		}

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

	reportValidity() {
		// @ts-ignore
		return this.shadowRoot.querySelector('input#search-input').reportValidity();
	}

	checkValidity() {
		// @ts-ignore
		return this.shadowRoot.querySelector('input#search-input').checkValidity();
	}

	setCustomValidity(message) {
		// @ts-ignore
		this.shadowRoot.querySelector('input#search-input').setCustomValidity(message);
	}

	get validationMessage() {
		// @ts-ignore
		return this.shadowRoot.querySelector('input#search-input').validationMessage;
	}

	get validity() {
		// @ts-ignore
		return this.shadowRoot.querySelector('input#search-input').validity;
	}

	get allowFiltering() {
		return this.#allowFiltering;
	}

	set allowFiltering(value) {
		this.#allowFiltering = value === true;
	}

	get pattern() {
		return this.#pattern ?? '';
	}

	set pattern(value) {
		this.#pattern = value;

		const input = this.shadowRoot.querySelector('input#search-input');
		if (input) {
			// @ts-ignore
			input.pattern = value;
		}
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
		this.signal(Update_Search, value);
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

	set isResponsive(value) {
		this.signal(Update_Is_Responsive, value === true);
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
