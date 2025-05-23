/**
 * @module modules/oaf/components/OafFilterGroup
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafFilterGroup.css';

const Update_Queryables = 'update_queryables';
const Update_Filters = 'update_filters';

/**
 * UX prototype implementation for ogc feature api filtering.
 *
 * @class
 * @author herrmutig
 */
export class OafFilterGroup extends MvuElement {
	constructor() {
		super({
			queryables: [],
			oafFilters: []
		});
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
		const { queryables, oafFilters } = model;

		const onAddFilter = (evt) => {
			this._addFilter(evt.target.value);
		};

		const onChangeFilter = (evt) => {
			const oafFilters = this.oafFilters;
			const changedFilterIndex = oafFilters.findIndex((oafFilter) => oafFilter.queryable.name === evt.target.queryable.name);
			oafFilters[changedFilterIndex] = { ...evt.target.getModel() };
			this.signal(Update_Filters, [...oafFilters]);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onRemoveFilter = (evt) => {
			this.signal(Update_Filters, this._removeFilter(evt.target.queryable.name));
		};

		const onRemoveGroup = () => {
			this.dispatchEvent(new CustomEvent('remove'));
		};

		return html`
			<style>
				${css}
			</style>

			<div class="filter-group">
				<h2 style="padding: 10px 0;">Filtergruppe</h2>
				<div class="btn-bar">
					<ba-button .type=${'primary'} .label=${'DUP'}></ba-button>
					<ba-button id="btn-remove-group" .type=${'primary'} class="remove-button" .label=${'X'} @click=${onRemoveGroup}></ba-button>
				</div>
				<select id="queryable-select" @change=${onAddFilter}>
					<option selected>Select Filter...</option>
					${queryables
						.filter((queryable) => !oafFilters.find((oafFilter) => oafFilter.queryable.name === queryable.name))
						.map((queryable) => html`<option .value=${queryable.name}>${queryable.name}</option>`)}
				</select>
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
				...this._createDefaultOafFilter(),
				queryable: queryableToAdd
			}
		]);

		this.dispatchEvent(new CustomEvent('change'));
	}

	_removeFilter(queryableName) {
		return this.getModel().oafFilters.filter((oafFilter) => oafFilter.queryable.name !== queryableName);
	}

	_createDefaultOafFilter() {
		return {
			queryable: {},
			operator: 'equals',
			value: null,
			minValue: null,
			maxValue: null
		};
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
