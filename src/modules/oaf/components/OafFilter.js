/**
 * @module modules/oaf/components/OafFilter
 */
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafFilter.css';

const Update_Queryable = 'update_queryable';
const Update_Operator = 'update_operator';
const Update_Value = 'update_value';
const Update_Min_Value = 'update_min_value';
const Update_Max_Value = 'update_max_value';

// TODO: observe model to invoke change events. (Same for OafFilterGroup)

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
			evt.target.value = this._changeValue(minValue, val, type, Update_Min_Value);
		};

		const onMaxValueChanged = (evt, val) => {
			evt.target.value = this._changeValue(maxValue, val, type, Update_Max_Value);
		};

		const onValueChanged = (evt, val) => {
			evt.target.value = this._changeValue(value, val, type, Update_Value);
		};

		const onOperatorSelect = (evt) => {
			this.signal(Update_Operator, evt.target.value);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onRemove = () => {
			this.dispatchEvent(new CustomEvent('remove', { detail: model.queryable }));
		};

		const getStringInputHtml = () => {
			return html`<div data-type="string">
				<ba-searchable-select
					class="value-input"
					@select=${(evt) => onValueChanged(evt, evt.target.selected)}
					.selected=${value}
					.options=${queryableValues}
				>
				</ba-searchable-select>
			</div>`;
		};

		const getTimeInputHtml = () => {
			return html`<div data-type="time">
				${operator === 'between'
					? html`<ba-searchable-select
								class="min-value-input"
								@select=${(evt) => onMinValueChanged(evt, evt.target.selected)}
								.selected=${minValue}
								.options=${queryableValues}
							>
							</ba-searchable-select>
							<ba-searchable-select
								class="max-value-input"
								@select=${(evt) => onMaxValueChanged(evt, evt.target.selected)}
								.selected=${maxValue}
								.options=${queryableValues}
							>
							</ba-searchable-select> `
					: html`<ba-searchable-select
							class="value-input"
							@select=${(evt) => onValueChanged(evt, evt.target.selected)}
							.selected=${value}
							.options=${queryableValues}
						>
						</ba-searchable-select>`}
			</div>`;
		};

		const getNumberInputHtml = () => {
			const step = type === 'integer' ? '1' : '0.1';
			const minRange = model.queryable.minValue;
			const maxRange = model.queryable.maxValue;

			const content = () => {
				if (operator === 'between') {
					return html`
						<input
							type="text"
							placeholder="0"
							class="min-value-input"
							.value=${minValue}
							step=${step}
							min=${minRange}
							max=${maxRange}
							@input=${(evt) => onMinValueChanged(evt, evt.target.value)}
						/>
						<input
							type="text"
							placeholder="0"
							class="max-value-input"
							.value=${maxValue}
							step=${step}
							min=${minRange}
							max=${maxRange}
							@input=${(evt) => onMaxValueChanged(evt, evt.target.value)}
						/>
					`;
				}

				return html`
					<input
						type="text"
						placeholder="0"
						.value=${value}
						step=${step}
						min=${minRange}
						max=${maxRange}
						@input=${(evt) => onValueChanged(evt, evt.target.value)}
					/>
				`;
			};

			return html`<div class="flex row" data-type=${type}>${content()}</div>`;
		};

		const getBooleanInputHtml = () => {
			return html`<select id="select-operator" data-type="boolean" @change=${onOperatorSelect}>
				<option selected value="true">Ja</option>
				<option selected value="false">Nein</option>
			</select>`;
		};

		const getInputHtml = () => {
			const content = () => {
				switch (type) {
					case 'string':
						return getStringInputHtml();
					case 'time':
						return getTimeInputHtml();
					case 'integer':
					case 'float':
						return getNumberInputHtml();
					case 'boolean':
						return getBooleanInputHtml();
					case 'date':
						return html`<div data-type="date"></div>`;
				}
				return nothing;
			};
			return html`<div>${content()}</div>`;
		};

		const getOperatorHtml = () => {
			return html`
				<div class="input-operator">
					<select id="select-operator" @change=${onOperatorSelect}>
						${operators.map((op) => html`<option .selected=${op === operator} .value=${op}>${op}</option>`)}
					</select>
				</div>
			`;
		};

		const toggleActiveButtonClass = (evt) => {
			evt.target.classList.toggle('active');
		};

		return html`
			<style>
				${css}
			</style>
			<div class="oaf-filter">
				<div class="grid-row">

						<div class="filter-title-container"><span class="title">${name}</span></div>
					<div class="grid-column-header">
						${getOperatorHtml()}
						<button class="not-button" @click=${toggleActiveButtonClass}>NOT</button>
						<button class="remove-button" @click=${onRemove}>X</button>
					</div>
					<div class="grid-column">
							<div class="input-value">${getInputHtml()}</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	set value(value) {
		this.signal(Update_Value, value);
		this.dispatchEvent(new CustomEvent('change'));
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
		const defaultOps = ['equals'];

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

	_changeValue(oldVal, val, type, signal) {
		const parsedValue = this._parseValue(val, type, oldVal);

		if (oldVal !== parsedValue) {
			this.signal(signal, parsedValue);
			this.dispatchEvent(new CustomEvent('change'));
		}

		return parsedValue;
	}

	_parseValue(val, type, fallback = null) {
		if (type === 'integer') {
			val = parseInt(val);
			return !isNaN(val) ? val : fallback;
		}

		if (type === 'float') {
			val = parseFloat(val);
			return !isNaN(val) ? val : fallback;
		}

		return val;
	}

	static get tag() {
		return 'ba-oaf-filter';
	}
}
