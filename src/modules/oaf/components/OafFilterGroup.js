/**
 * @module modules/examples/ogc/components/OafFilter
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafFilterGroup.css';

const Update_Queryables = 'update_queryables';
const Update_Filter = 'update_filter';

/**
 * UX prototype implementation for ogc feature api filtering.
 *
 * @class
 * @author herrmutig
 */
export class OafFilterGroup extends MvuElement {
	constructor() {
		super({
			activeQueryables: [],
			queryables: []
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Queryables:
				return { ...model, queryables: [...data] };
			case Update_Filter:
				return { ...model, activeQueryables: [...data] };
		}
		return model;
	}

	_addFilter(newQueryable) {
		const activeQueryables = this.getModel().activeQueryables;
		if (!activeQueryables.includes((queryable) => queryable === newQueryable)) {
			return [...activeQueryables, newQueryable];
		}

		return [...activeQueryables];
	}

	_removeFilter(activeQueryableToRemove) {
		return this.getModel().activeQueryables.filter((queryable) => queryable !== activeQueryableToRemove);
	}

	createView(model) {
		const { queryables, activeQueryables } = model;

		const onAddFilter = (evt) => {
			const queryableSelectValue = evt.target.value;
			const queryableToAdd = queryables.find((queryable) => queryable.name == queryableSelectValue);
			this.signal(Update_Filter, this._addFilter(queryableToAdd));
		};

		const onChangeFilter = (evt) => {
			console.log(this.oafFilters);
		};

		const onRemoveFilter = (evt) => {
			this.signal(Update_Filter, this._removeFilter(evt.target.queryable));
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
				<ba-button .type=${'primary'} .label=${'X'} @click=${onRemoveGroup}></ba-button>
				<select id="queryable-select" @change=${onAddFilter}>
					<option selected>Select Filter...</option>
					${queryables
						.filter((queryable) => !activeQueryables.includes(queryable))
						.map((queryable) => html`<option .value=${queryable.name}>${queryable.name}</option>`)}
				</select>
				<div class="">
					${activeQueryables.map(
						(queryable) => html`<ba-oaf-filter .queryable=${queryable} @change=${onChangeFilter} @remove=${onRemoveFilter}></ba-oaf-filter>`
					)}
					<div class="ogc-filter-navigation"></div>
				</div>
			</div>
		`;
	}

	set queryables(value) {
		this.signal(Update_Queryables, value);
	}

	get oafFilters() {
		return Array.from(this.shadowRoot.querySelectorAll('ba-oaf-filter'));
	}

	static get tag() {
		return 'ba-oaf-filter-group';
	}
}
