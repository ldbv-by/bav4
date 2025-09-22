/**
 * @module modules/oaf/components/OafFilterGroup
 */

import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { createDefaultOafFilter } from '../utils/oafUtils';
import css from './oafFilterGroup.css';
import { $injector } from '../../../injection';
import closeSvg from '../../../assets/icons/x-square.svg';
import cloneSvg from './assets/clone.svg';
import { repeat } from 'lit-html/directives/repeat.js';
import { nothing } from '../../../../node_modules/lit-html/lit-html';

const Update_Queryables = 'update_queryables';
const Update_Filters = 'update_filters';

/**
 * A Container for OGC Feature API specific filters that are "AND" connected with each other
 *
 * @property {Array<Object>} oafFilters The Collection of filters that were added onto this group
 * @property {Array<OafQueryable>} queryables The OafQueryable to create oafFilters for this group
 *
 * @fires change Fires when this component or one of it's filters changes
 * @fires remove Fires when the filter group informs it's parent that it wants to be removed
 *
 * @class
 * @author herrmutig
 */
export class OafFilterGroup extends MvuElement {
	#translationService;

	constructor() {
		super({
			queryables: [],
			oafFilters: []
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this.#translationService = translationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Queryables:
				return { ...model, queryables: [...data] };
			case Update_Filters:
				return { ...model, oafFilters: [...data] };
		}
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { queryables, oafFilters } = model;

		const onAddFilter = (evt) => {
			this._addFilter(evt.target.value);

			// Resets select to "Choose Filter..." Option
			evt.target.selectedIndex = 0;
			evt.target.blur();
		};

		const onFilterChanged = (evt) => {
			const changedOafFilter = evt.target;
			const filters = this.oafFilters;
			const changedFilterIndex = filters.findIndex((oafFilter) => oafFilter.queryable.id === evt.target.queryable.id);

			filters[changedFilterIndex] = {
				...changedOafFilter.getModel()
			};

			this.signal(Update_Filters, filters);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onRemoveFilter = (evt) => {
			this._removeFilter(evt.target.queryable.id);
		};

		const onRemoveGroup = () => {
			this.dispatchEvent(new CustomEvent('remove'));
		};

		const onDuplicateGroup = () => {
			this.dispatchEvent(new CustomEvent('duplicate'));
		};

		return html`
			<style>
				${css}
			</style>
			<div class="filter-group" part="filter-group">
				<div class="select-container" part="select-container">
					<div class="ba-form-element" part="form-element">
						<select id="queryable-select" required="" @change=${onAddFilter}>
							<option selected></option>
							${queryables
								.filter((queryable) => !oafFilters.find((oafFilter) => oafFilter.queryable.id === queryable.id))
								.map((queryable) => {
									const description = queryable.description ?? nothing;
									return html`<option title=${description} .value=${queryable.id}>${queryable.title ? queryable.title : queryable.id}</option>`;
								})}
						</select>
						<label id="queryable-label" for="select" class="control-label">${translate('oaf_group_select_filter')}</label><i class="bar"></i>
					</div>
				</div>
				<div class="filter-container" part="filter-container">
					${repeat(
						oafFilters,
						(oafFilter) => oafFilter.queryable.id,
						(oafFilter) =>
							html`<ba-oaf-filter
								.operator=${oafFilter.operator}
								.value=${oafFilter.value}
								.maxValue=${oafFilter.maxValue}
								.minValue=${oafFilter.minValue}
								.queryable=${oafFilter.queryable}
								@change=${onFilterChanged}
								@remove=${onRemoveFilter}
							></ba-oaf-filter>`
					)}
				</div>
				<div class="button-container" part="button-container">
					<ba-icon id="btn-duplicate" .type=${'primary'} .size=${2.5} class="duplicate-button" .icon=${cloneSvg} @click=${onDuplicateGroup}></ba-icon>
					<ba-icon id="btn-remove" .size=${1.6} .type=${'primary'} class="remove-button" .icon=${closeSvg} @click=${onRemoveGroup}></ba-icon>
				</div>
			</div>
		`;
	}

	_addFilter(queryableId) {
		const { queryables, oafFilters } = this.getModel();
		const queryableToAdd = queryables.find((queryable) => queryable.id === queryableId);

		if (queryableToAdd === undefined) {
			return;
		}

		// A newly created filter will invoke a change event initially (see oafFilter.js, onInitialize())
		this.signal(Update_Filters, [
			...oafFilters,
			{
				...createDefaultOafFilter(),
				queryable: queryableToAdd
			}
		]);
	}

	_removeFilter(queryableId) {
		const changedFilters = this.getModel().oafFilters.filter((oafFilter) => oafFilter.queryable.id !== queryableId);
		this.signal(Update_Filters, changedFilters);
		this.dispatchEvent(new CustomEvent('change'));
	}

	set queryables(value) {
		this.signal(Update_Queryables, value);
	}

	set oafFilters(value) {
		this.signal(Update_Filters, value);
	}

	get oafFilters() {
		return this.getModel().oafFilters;
	}

	static get tag() {
		return 'ba-oaf-filter-group';
	}
}
