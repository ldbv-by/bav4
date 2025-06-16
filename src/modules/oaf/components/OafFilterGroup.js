/**
 * @module modules/oaf/components/OafFilterGroup
 */

import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { createDefaultOafFilter } from './oafUtils';
import css from './oafFilterGroup.css';
import { $injector } from '../../../injection';

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
		};

		const onChangeFilter = (evt) => {
			const changedOafFilter = evt.target;
			const filters = this.oafFilters;
			const changedFilterIndex = filters.findIndex((oafFilter) => oafFilter.queryable.name === evt.target.queryable.name);

			filters[changedFilterIndex] = {
				...changedOafFilter.getModel(),
				expression: changedOafFilter.expression
			};

			this.signal(Update_Filters, filters);

			this.dispatchEvent(new CustomEvent('change'));
		};

		const onRemoveFilter = (evt) => {
			this._removeFilter(evt.target.queryable.name);
		};

		const onRemoveGroup = () => {
			this.dispatchEvent(new CustomEvent('remove'));
		};

		return html`
			<style>
				${css}
			</style>

			<div class="filter-group">
				<div class="title-bar">
					<h2 class="title">${translate('oaf_group_title')}</h2>
					<div class="btn-bar">
						<select id="queryable-select" @change=${onAddFilter}>
							<option selected>${translate('oaf_group_select_filter')}</option>
							${queryables
								.filter((queryable) => !oafFilters.find((oafFilter) => oafFilter.queryable.name === queryable.name))
								.map((queryable) => html`<option .value=${queryable.name}>${queryable.name}</option>`)}
						</select>
						<ba-button .type=${'primary'} class="duplicate-button" .label=${'DUP'}></ba-button>
						<ba-button id="btn-remove-group" .type=${'primary'} class="remove-button" .label=${'X'} @click=${onRemoveGroup}></ba-button>
					</div>
				</div>
				<div class="filter-container">
					${oafFilters.map(
						(oafFilter) =>
							html`<ba-oaf-filter
								.operator=${oafFilter.operator}
								.value=${oafFilter.value}
								.maxValue=${oafFilter.maxValue}
								.minValue=${oafFilter.minValue}
								.queryable=${oafFilter.queryable}
								@change=${onChangeFilter}
								@remove=${onRemoveFilter}
							></ba-oaf-filter>`
					)}
				</div>
			</div>
		`;
	}

	_addFilter(queryableName) {
		const { queryables, oafFilters } = this.getModel();
		const queryableToAdd = queryables.find((queryable) => queryable.name === queryableName);

		if (queryableToAdd === undefined) {
			return;
		}

		this.signal(Update_Filters, [
			...oafFilters,
			{
				...createDefaultOafFilter(),
				queryable: queryableToAdd
			}
		]);

		this.dispatchEvent(new CustomEvent('change'));
	}

	_removeFilter(queryableName) {
		const changedFilters = this.getModel().oafFilters.filter((oafFilter) => oafFilter.queryable.name !== queryableName);
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
