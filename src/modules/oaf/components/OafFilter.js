/**
 * @module modules/oaf/components/OafFilter
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafFilter.css';

const Update_Queryable = 'update_queryable';
const Update_Operator = 'update_operator';
const Update_Value = 'update_value';
const Update_Min_Value = 'update_min_value';
const Update_Max_Value = 'update_max_value';

/**
 * UX prototype implementation for ogc feature api filtering.
 *
 * @class
 * @author herrmutig
 */
export class OafFilter extends MvuElement {
	constructor() {
		super({
			queryable: {},
			operator: 'equals',
			value: null,
			minValue: null,
			maxValue: null
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Queryable:
				return { ...model, queryable: data };
			case Update_Operator:
				return { ...model, operator: data };
			case Update_Value:
				return { ...model, value: data };
			case Update_Min_Value:
				return { ...model, minValue: data };
			case Update_Max_Value:
				return { ...model, maxValue: data };
		}
	}

	createView(model) {
		const { minValue, maxValue, value, operator } = model;
		const { name, type, values: queryableValues } = model.queryable;
		const operators = this._getOperators(type);

		const onMinValueChanged = (evt, val) => {
			this.signal(Update_Min_Value, val);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onMaxValueChanged = (evt, val) => {
			this.signal(Update_Max_Value, val);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onValueChanged = (evt, val) => {
			this.signal(Update_Value, val);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onOperatorSelect = (evt) => {
			this.signal(Update_Operator, evt.target.value);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onRemove = () => {
			this.dispatchEvent(new CustomEvent('remove', { detail: model.queryable }));
		};

		const getStringInputHtml = () => {
			html`<ba-searchable-select @select=${(evt) => onValueChanged(evt, evt.target.selected)} .selected=${value} .options=${queryableValues}>
			</ba-searchable-select>`;
		};

		const getTimeInputHtml = () => {
			html`
				${operator === 'between'
					? html`<ba-searchable-select
								@select=${(evt) => onMinValueChanged(evt, evt.target.selected)}
								.selected=${minValue}
								.options=${queryableValues}
							>
							</ba-searchable-select>
							<ba-searchable-select @select=${(evt) => onMaxValueChanged(evt, evt.target.selected)} .selected=${maxValue} .options=${queryableValues}>
							</ba-searchable-select> `
					: html`<ba-searchable-select @select=${(evt) => onValueChanged(evt, evt.target.selected)} .selected=${value} .options=${queryableValues}>
						</ba-searchable-select>`}
			`;
		};

		const getNumberInputHtml = () => {
			return html``;
		};

		const getInputHtml = () => {
			const content = () => {
				switch (type) {
					case 'string':
						return getStringInputHtml();
					case 'time': {
						return getTimeInputHtml();
					}
					case 'integer': {
						return getNumberInputHtml();
					}
				}
				return html``;
			};

			return html`${content()}`;
		};

		const toggleActiveButtonClass = (evt) => {
			evt.target.classList.toggle('active');
		};

		return html`
			<style>
				${css}
			</style>
			<div class="ogc-filter-row">
				<div class="grid-row">
					<div class="grid-column-header">
						<div class="input-filter"><span>${name}</span></div>
						<button class="not-button" @click=${toggleActiveButtonClass}>NOT</button>
						<button class="remove-button" @click=${onRemove}>X</button>
					</div>
					<div class="grid-column">
							<div class="input-operator">
								<select @change=${onOperatorSelect}>
									${operators.map((op) => html`<option .selected=${op === operator} .value=${op}>${op}</option>`)}
								</select>
							</div>
							<div class="input-value">${getInputHtml()}</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	set value(value) {
		this.signal(Update_Value, value);
	}

	get value() {
		return this.getModel().value;
	}

	set maxValue(value) {
		this.signal(Update_Max_Value, value);
	}

	get maxValue() {
		return this.getModel().maxValue;
	}
	set minValue(value) {
		this.signal(Update_Min_Value, value);
	}

	get minValue() {
		return this.getModel().minValue;
	}

	get queryable() {
		return this.getModel().queryable;
	}

	set queryable(value) {
		this.signal(Update_Queryable, value);
	}

	get operator() {
		return this.getModel().operator;
	}

	set operator(value) {
		this.signal(Update_Operator, value);
	}

	_getOperators(type) {
		const defaultOps = ['equals', 'not equals'];

		switch (type) {
			case 'time':
			case 'float':
			case 'integer': {
				return [...defaultOps, 'greater', 'lesser', 'between'];
			}
			case 'string':
				return [...defaultOps, 'contains'];
		}

		return defaultOps;
	}

	static get tag() {
		return 'ba-oaf-filter';
	}
}
