/**
 * @module modules/examples/ogc/components/OgcFeaturesMask
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafMask.css';

const Update_Capabilities = 'update_capabilities';
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
			queryables: []
		});
	}

	onInitialize() {
		const capabilities = {
			totalNumberOfItems: 100,
			sampled: false,
			queryables: [
				{
					name: 'node_id',
					type: 'integer',
					values: [],
					finalList: false
				},
				{
					name: 'id',
					type: 'integer',
					values: [],
					finalList: false
				},
				{
					name: 'name',
					type: 'string',
					values: ['Franz', 'Markus', 'Michael'],
					finalList: false
				},
				{
					name: 'strasse',
					type: 'string',
					values: [],
					finalList: false
				},
				{
					name: 'plz',
					type: 'string',
					values: [],
					finalList: false
				},
				{
					name: 'ort',
					type: 'string',
					values: [],
					finalList: false
				},
				{
					name: 'outdoor_seating',
					type: 'boolean',
					values: [],
					finalList: false
				},
				{
					name: 'open',
					type: 'string',
					values: ['Geöffnet', 'Geschlossen'],
					finalList: true
				},
				{
					name: 'close',
					type: 'string',
					values: [],
					finalList: true
				},
				{
					name: 'geom',
					type: 'geometry',
					values: [],
					finalList: false
				},
				{
					name: 'area',
					type: 'float',
					values: [],
					finalList: false
				},
				{
					name: 'buildyear',
					type: 'integer',
					values: [1900, 1901, 1902, 1903, 1904, 1905, 2000, 2005, 2006, 2009, 2012],
					finalList: true
				},
				{
					name: 'color',
					type: 'string',
					values: ['Rot', 'Grün', 'Gelb', 'Magenta', 'Blau', 'Rotwein', 'Beige', 'Orange'],
					finalList: true
				}
			]
		};

		this.signal(Update_Capabilities, capabilities);
		this.signal(Update_Filter);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Capabilities:
				return { ...model, queryables: data.queryables };
			case Update_Filter:
				return this.updateFilters(model);
		}
	}

	createView(model) {
		const onAddFilter = (evt) => {
			const queryables = model.queryables;
			let target = queryables.find((filter) => filter.name.valueOf() == evt.target.value);
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
				<select id="queryable-select" @change=${onAddFilter}>
					<option selected value=""></option>
					${inactiveFilters.map((filter) => html`<option .value=${filter.name}>${filter.name}</option>`)}
				</select>
				<div class="grid-container">
					${activeFilters.map((filter) => html`<ba-oaf-row .filter=${filter} @removeRow=${onRemoveFilter}></ba-oaf-row>`)}
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
