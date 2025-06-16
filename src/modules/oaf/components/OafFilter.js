/**
 * @module modules/oaf/components/OafFilter
 */
import css from './oafFilter.css';
import { $injector } from '../../../injection';
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { isString } from '../../../utils/checks';
import { getOperatorDefinitions, getOperatorByName, createCqlFilterExpression, CqlOperator } from './oafUtils';
import { OafQueryableType } from '../../../domain/oaf';

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
			operator: getOperatorByName(CqlOperator.EQUALS),
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
		// Creation of a filter is considered a change
		this.dispatchEvent(new CustomEvent('change'));
		this.observeModel(['operator', 'minValue', 'maxValue', 'value'], () => this.dispatchEvent(new CustomEvent('change')));
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { minValue, maxValue, value, operator } = model;
		const { name, type, values: queryableValues, finalized } = model.queryable;
		const operators = getOperatorDefinitions(type);

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
			this.signal(Update_Operator, getOperatorByName(evt.target.value));
		};

		const onRemove = () => {
			this.dispatchEvent(new CustomEvent('remove'));
		};

		const getStringInputHtml = () => {
			return html`<div data-type="${OafQueryableType.STRING}">
				<ba-searchable-select
					class="value-input"
					@select=${(evt) => onValueChanged(evt, evt.target.selected)}
					.selected=${value}
					.options=${queryableValues}
					.allowFreeText=${!finalized}
					.dropdownHeader=${finalized ? null : translate('oaf_filter_dropdown_header_title')}
				>
				</ba-searchable-select>
			</div>`;
		};

		const getTimeInputHtml = () => {
			return html`<div data-type="time">
				${operator.name === 'between'
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
				if (operator.name === 'between') {
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
			return html`<select class="value-input" data-type="${OafQueryableType.BOOLEAN}" @change=${(evt) => onValueChanged(evt, evt.target.value)}>
				<option selected value="true">${translate('oaf_filter_yes')}</option>
				<option selected value="false">${translate('oaf_filter_no')}</option>
			</select>`;
		};

		const getInputHtml = () => {
			const content = () => {
				switch (type) {
					case OafQueryableType.STRING:
						return getStringInputHtml();
					case OafQueryableType.INTEGER:
					case OafQueryableType.FLOAT:
						return getNumberInputHtml();
					case OafQueryableType.BOOLEAN:
						return getBooleanInputHtml();
					case OafQueryableType.DATE:
						return html`<div data-type="${OafQueryableType.DATE}"></div>`;
					case 'time':
						return getTimeInputHtml();
				}
				return nothing;
			};
			return html`<div>${content()}</div>`;
		};

		const getOperatorHtml = () => {
			return html`
				<div class="input-operator">
					<select id="select-operator" @change=${onOperatorSelect}>
						${operators.map((op) => html`<option .selected=${op === operator} .value=${op.name}>${translate(op.key)}</option>`)}
					</select>
				</div>
			`;
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
						<button class="not-button">NOT</button>
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
		if (isString(value)) {
			this.signal(Update_Operator, getOperatorByName(value));
		} else {
			this.signal(Update_Operator, value);
		}
	}

	get expression() {
		return createCqlFilterExpression(this.getModel());
	}

	_updateValue(newValue, oldValue, signal) {
		const parsedValue = this._parseValue(newValue, oldValue);
		this.signal(signal, parsedValue);
		return parsedValue;
	}

	_parseValue(value, fallback) {
		const type = this.queryable.type;

		if (type === OafQueryableType.INTEGER) {
			value = parseInt(value);
			return !isNaN(value) ? value : fallback;
		}

		if (type === OafQueryableType.FLOAT) {
			value = parseFloat(value);
			return !isNaN(value) ? value : fallback;
		}

		if (type === OafQueryableType.BOOLEAN) {
			value = value ?? false;
		}

		return value;
	}

	static get tag() {
		return 'ba-oaf-filter';
	}
}
