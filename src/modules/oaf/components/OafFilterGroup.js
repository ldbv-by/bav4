/**
 * @module modules/examples/ogc/components/OafFilter
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
		return model;
	}

	createView(model) {
		const { queryables, oafFilters } = model;

		const onAddFilter = (evt) => {
			this._addFilter(evt.target.value);
			this.dispatchEvent(new CustomEvent('change'));
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
					<ba-button .type=${'primary'} class="remove-button" .label=${'X'} @click=${onRemoveGroup}></ba-button>
				</div>
				<select id="queryable-select" @change=${onAddFilter}>
					<option selected>Select Filter...</option>
					${queryables
						.filter((queryable) => !oafFilters.includes((oafFilter) => oafFilter.queryable === queryable))
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
					<div class="ogc-filter-navigation"></div>
				</div>
			</div>
		`;
	}

	_addFilter(queryableName) {
		const { queryables, oafFilters } = this.getModel();
		const queryableToAdd = queryables.find((queryable) => queryable.name == queryableName);

		if (oafFilters.includes((queryable) => queryable === queryableToAdd)) {
			return;
		}

		this.signal(Update_Filters, [
			...oafFilters,
			{
				...this._createOafFilterModel(),
				queryable: queryableToAdd
			}
		]);
	}

	_removeFilter(queryableName) {
		return this.getModel().oafFilters.filter((oafFilter) => oafFilter.queryable.name !== queryableName);
	}

	_createOafFilterModel() {
		return {
			value: null,
			minValue: null,
			maxValue: null,
			operator: null,
			queryable: null
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
