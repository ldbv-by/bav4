/**
 * @module modules/oaf/components/OafFilter
 */
import { $injector } from '../../../injection';
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafFilter.css';
import closeSvg from './assets/clear.svg';

const Update_Queryable = 'update_queryable';
const Update_Operator = 'update_operator';
const Update_Value = 'update_value';
const Update_Min_Value = 'update_min_value';
const Update_Max_Value = 'update_max_value';

/**
 * A Filter for the OGC Feature API which filters a provided queryable
 *
 * @property {OafQueryable} queryable={} The queryable for this filter. Provides necessary definitions for the filter's display
 * @property {string} operator=equals The operator for this filter. Defines how the filter will be applied
 * @property {string|number|null} value=null The value of this filter.
 * @property {number|null} minValue=null The minValue of this filter. Optional, only used when available in provided queryable
 * @property {number|null} maxValue=null The maxValue of this filter. Optional, only used when available in provided queryable
 *
 * @fires change Fires when the component's operator or value changes
 * @fires remove Fires when the component informs it's parent that it wants to be removed
 *
 * @class
 * @author herrmutig
 */
export class OafFilter extends MvuElement {
	#translationService;

	constructor() {
		super({
			queryable: {},
			operator: 'equals',
			value: null,
			minValue: null,
			maxValue: null
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this.#translationService = translationService;
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

	onInitialize() {
		this.observeModel('operator', () => this.dispatchEvent(new CustomEvent('change')));
		this.observeModel('minValue', () => this.dispatchEvent(new CustomEvent('change')));
		this.observeModel('maxValue', () => this.dispatchEvent(new CustomEvent('change')));
		this.observeModel('value', () => this.dispatchEvent(new CustomEvent('change')));
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { minValue, maxValue, value, operator } = model;
		const { name, type, values: queryableValues } = model.queryable;
		const operators = this._getOperators(type);

		const onMinValueChanged = (evt, newValue) => {
			evt.target.value = this._updateValue(newValue, minValue, Update_Min_Value);
		};

		const onMaxValueChanged = (evt, newValue) => {
			evt.target.value = this._updateValue(newValue, maxValue, Update_Max_Value);
		};

		const onValueChanged = (evt, newValue) => {
			evt.target.value = this._updateValue(newValue, value, Update_Value);
		};

		const onOperatorSelect = (evt) => {
			this.signal(Update_Operator, evt.target.value);
		};

		const onRemove = () => {
			this.dispatchEvent(new CustomEvent('remove'));
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
						class="value-input"
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
			return html`<select data-type="boolean" @change=${onOperatorSelect}>
				<option selected value="true">${translate('oaf_filter_yes')}</option>
				<option selected value="false">${translate('oaf_filter_no')}</option>
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

		return html`
			<style>
				${css}
			</style>
			<div class="oaf-filter">				
				<div class="flex">
					<span class="title">${name}</span>
				</div>
				${getOperatorHtml()}											
				<div>
					<div class="input-value">${getInputHtml()}</div>
				</div>
					<ba-icon class="remove-button" .icon=${closeSvg} .color=${'var(--primary-color)'} .color_hover=${'var(--error-color)'}  .size=${1.6} @click=${onRemove}></ba-icon>
				</div>				
			</div>
		`;
	}

	set value(value) {
		this._updateValue(value, this.value, Update_Value);
	}

	get value() {
		return this.getModel().value;
	}

	set maxValue(value) {
		this._updateValue(value, this.value, Update_Max_Value);
	}

	get maxValue() {
		return this.getModel().maxValue;
	}
	set minValue(value) {
		this._updateValue(value, this.value, Update_Min_Value);
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

	_updateValue(newValue, oldValue, signal) {
		const parsedValue = this._parseValue(newValue, oldValue);
		this.signal(signal, parsedValue);
		return parsedValue;
	}

	_parseValue(value, fallback) {
		const type = this.queryable.type;

		if (type === 'integer') {
			value = parseInt(value);
			return !isNaN(value) ? value : fallback;
		}

		if (type === 'float') {
			value = parseFloat(value);
			return !isNaN(value) ? value : fallback;
		}

		return value;
	}

	static get tag() {
		return 'ba-oaf-filter';
	}
}
