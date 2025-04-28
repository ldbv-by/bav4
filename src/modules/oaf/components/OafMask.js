/**
 * @module modules/examples/ogc/components/OgcFeaturesMask
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafMask.css';

const Update_Filter = 'update_filter';

/**
 * Displays and allows filtering for OGC Feature API queryables
 *
 * @class
 * @author herrmutig
 */
export class OafMask extends MvuElement {
	constructor() {
		super({
			activeFilters: [],
			inactiveFilters: [],
			queryables: [
				{
					key: 'owner',
					label: 'Besitzer',
					values: ['Franz Strauß', 'Klaus Amadeus Mozart', 'Michael van Beethoven', 'Manuel Mayer'],
					type: 'string'
				},
				{
					key: 'area',
					label: 'Fläche',
					min: 0,
					max: 1000,
					type: 'float'
				},
				{
					key: 'address',
					label: 'Adresse',
					type: 'string'
				},
				{
					key: 'buildyear',
					label: 'Baujahr',
					min: 1800,
					max: 2025,
					type: 'int'
				},
				{
					key: 'color',
					label: 'Farbe',
					values: ['Rot', 'Grün', 'Gelb', 'Magenta', 'Blau', 'Rotwein', 'Beige', 'Orange'],
					type: 'string'
				},
				{
					key: 'last_check_date',
					label: 'Letztes Gutachten',
					type: 'date'
				},
				{
					key: 'print_due',
					label: 'Ausdruck fällig',
					type: 'bool'
				}
			]
		});
	}

	onInitialize() {
		this.signal(Update_Filter);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Filter:
				return this.updateFilters(model);
		}
	}

	createView(model) {
		const onAddFilter = (evt) => {
			const queryables = model.queryables;
			let target = queryables.find((filter) => filter.key.valueOf() == evt.target.value);
			target.active = true;

			const queryableSelect = this.shadowRoot.getElementById('queryable-select');
			queryableSelect.selectedIndex = 0;
			this.signal(Update_Filter);
		};

		const onRemoveFilter = (evt) => {
			evt.detail.active = false;
			this.signal(Update_Filter);
		};

		const { activeFilters, inactiveFilters } = model;

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<h2>OGC Filter</h2>
				<select id="queryable-select" autocomplete="on" @change=${onAddFilter}>
					<option selected value=""></option>
					${inactiveFilters.map((filter) => html`<option .value=${filter.key}>${filter.label}</option>`)}
				</select>
				<div class="grid-container">
					${activeFilters.map((filter) => html` <ba-ogc-feature-row .filter=${filter} @removeRow=${onRemoveFilter}></ba-ogc-feature-row> `)}
					<div class="ogc-filter-navigation"></div>
				</div>
			</div>
		`;
	}

	updateFilters(model) {
		const activeFilters = [];
		const inactiveFilters = [];

		for (const queryable of model.queryables) {
			if (queryable.active) {
				activeFilters.push(queryable);
				continue;
			}
			inactiveFilters.push(queryable);
		}

		return { ...model, activeFilters: activeFilters, inactiveFilters: inactiveFilters };
	}

	static get tag() {
		return 'ba-oaf-mask';
	}
}
