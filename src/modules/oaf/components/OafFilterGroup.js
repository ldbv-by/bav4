/**
 * @module modules/examples/ogc/components/OafRow
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
			activeFilters: [],
			queryables: []
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Queryables:
				return { ...model, queryables: [...data] };
			case Update_Filter:
				return { ...model, activeFilters: [...data] };
		}
		return model;
	}

	_addFilter(arr, queryableToAdd) {
		if (!arr.includes((filter) => filter === queryableToAdd)) {
			return [...arr, queryableToAdd];
		}

		return [...arr];
	}

	_removeFilter(arr, queryableToRemove) {
		return arr.filter((filter) => filter !== queryableToRemove);
	}

	createView(model) {
		const { queryables, activeFilters } = model;

		const onAddFilter = (evt) => {
			let target = queryables.find((filter) => filter.name.valueOf() == evt.target.value);
			const queryableSelect = this.shadowRoot.getElementById('queryable-select');
			queryableSelect.selectedIndex = 0;
			this.signal(Update_Filter, this._addFilter(activeFilters, target));
		};

		const onRemoveFilter = (evt) => {
			this.signal(Update_Filter, this._removeFilter(activeFilters, evt.detail));
		};

		return html`
			<style>
				${css}
			</style>
			<div class="filter-group">
				<h2>OGC Filter</h2>
				<select id="queryable-select" @change=${onAddFilter}>
					${queryables
						.filter((queryable) => !activeFilters.includes(queryable))
						.map((queryable) => html`<option .value=${queryable.name}>${queryable.name}</option>`)}
				</select>
				<div class="">
					${activeFilters.map((filter) => html`<ba-oaf-row .filter=${filter} @removeRow=${onRemoveFilter}></ba-oaf-row>`)}
					<div class="ogc-filter-navigation"></div>
				</div>
			</div>
		`;
	}

	set queryables(value) {
		this.signal(Update_Queryables, value);
	}

	static get tag() {
		return 'ba-oaf-filter-group';
	}
}
