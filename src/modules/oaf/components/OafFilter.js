/**
 * @module modules/oaf/components/OafFilter
 */
import css from './oafFilter.css';
import { $injector } from '../../../injection';
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import closeSvg from './assets/clear.svg';
import { isNumber, isString } from '../../../utils/checks';
import { getOperatorDefinitions, getOperatorByName, createCqlFilterExpression, OafOperator, OafOperatorType } from '../utils/oafUtils';
import { OafQueryableType } from '../../../domain/oaf';

const Update_Queryable = 'update_queryable';
const Update_Operator = 'update_operator';
const Update_Value = 'update_value';
const Update_Min_Value = 'update_min_value';
const Update_Max_Value = 'update_max_value';
/**
 * A Filter for the OGC Feature API which filters a provided queryable
 *
 * @property {OafQueryable}  queryable={} The queryable for this filter. Provides necessary definitions for the filter's display
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

	/** An OafFilter is considered dirty if:
	 * - The filter field changes from a valid to an invalid value (e.g. by pressing Enter after typing an invalid text).
	 * - The invalid field did not receive any new input
	 */
	#valueDirty = false;

	constructor() {
		super({
			queryable: {},
			operator: getOperatorByName(OafOperator.EQUALS),
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
		const { queryable, minValue, maxValue, value } = this.getModel();

		// Ensures values are set correctly when 'queryable' is missing.
		// This can happen if 'queryable' is set after the value properties in 'OafFilterGroup'.
		if (queryable.type !== undefined) {
			this.value = value;
			this.maxValue = maxValue;
			this.minValue = minValue;

			// The creation of a filter is considered a change
			this.dispatchEvent(new CustomEvent('change'));
		}

		this.observeModel(['operator', 'minValue', 'maxValue', 'value'], () => this.dispatchEvent(new CustomEvent('change')));
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { minValue, maxValue, value, operator, queryable } = model;
		const pattern = operator.allowPattern ? (queryable.pattern ?? nothing) : nothing;

		const operators = getOperatorDefinitions(queryable.type);

		const onMinValueChanged = (evt, newValue) => {
			if (this._validateField(evt.target)) {
				this._updateValue(newValue, minValue, Update_Min_Value);
				this.#valueDirty = false;
			} else {
				this.#valueDirty = true;
			}
		};

		const onMaxValueChanged = (evt, newValue) => {
			if (this._validateField(evt.target)) {
				this._updateValue(newValue, maxValue, Update_Max_Value);
				this.#valueDirty = false;
			} else {
				this.#valueDirty = true;
			}
		};

		const onValueChanged = (evt, newValue) => {
			if (this._validateField(evt.target)) {
				this._updateValue(newValue, value, Update_Value);
				this.#valueDirty = false;
			} else {
				this.#valueDirty = true;
			}
		};

		const onValueInput = (evt, fallback) => {
			evt.target.value = this._parseValue(evt.target.value ?? evt.target.search, fallback);

			if (this.#valueDirty) {
				this.#valueDirty = !this._validateField(evt.target);
			}
		};

		const onOperatorSelect = (evt) => {
			this.signal(Update_Operator, getOperatorByName(evt.target.value));
		};

		const onRemove = () => {
			this.dispatchEvent(new CustomEvent('remove'));
		};

		const getStringInputHtml = () => {
			return html`<div data-type=${OafQueryableType.STRING}>
				<ba-searchable-select
					class="value-input"
					@select=${(evt) => onValueChanged(evt, evt.target.search)}
					@input=${(evt) => onValueInput(evt, evt.target.search)}
					.maxEntries=${queryable.finalized ? 10 : 5}
					.selected=${value}
					.placeholder=${translate('oaf_filter_input_placeholder')}
					.options=${queryable.values}
					.allowFreeText=${true}
					.allowFiltering=${queryable.finalized}
					.pattern=${pattern}
					.dropdownHeader=${queryable.finalized ? null : translate('oaf_filter_dropdown_header_title')}
				>
				</ba-searchable-select>
			</div>`;
		};

		const getNumberInputHtml = () => {
			const step = queryable.type === OafQueryableType.INTEGER ? '1' : 'any';
			const minRange = queryable.minValue ?? nothing;
			const maxRange = queryable.maxValue ?? nothing;

			const content = () => {
				if (operator.operatorType === OafOperatorType.Comparison) {
					return html`
						<input
							type="number"
							placeholder=${translate('oaf_filter_input_placeholder')}
							class="min-value-input"
							.step=${step}
							.min=${minRange}
							.max=${maxRange}
							.value=${minValue}
							.pattern=${pattern}
							@change=${(evt) => onMinValueChanged(evt, evt.target.value)}
							@input=${(evt) => onValueInput(evt, minValue)}
						/>
						<input
							type="number"
							class="max-value-input"
							.step=${step}
							.min=${minRange}
							.max=${maxRange}
							placeholder=${translate('oaf_filter_input_placeholder')}
							.value=${maxValue}
							.pattern=${pattern}
							@change=${(evt) => onMaxValueChanged(evt, evt.target.value)}
							@input=${(evt) => onValueInput(evt, maxValue)}
						/>
					`;
				}

				return html`
					<input
						type="number"
						.placeholder=${translate('oaf_filter_input_placeholder')}
						class="value-input"
						.value=${value}
						.step=${step}
						.min=${minRange}
						.max=${maxRange}
						.pattern=${pattern}
						@change=${(evt) => onValueChanged(evt, evt.target.value)}
						@input=${(evt) => onValueInput(evt, value)}
					/>
				`;
			};

			return html`<div class="flex row" data-type=${queryable.type}>${content()}</div>`;
		};

		const getBooleanInputHtml = () => {
			return html`<select class="value-input" data-type=${OafQueryableType.BOOLEAN} @change=${(evt) => onValueChanged(evt, evt.target.value)}>
				<option ?selected=${value === true} value="true">${translate('oaf_filter_yes')}</option>
				<option ?selected=${value !== true} value="false">${translate('oaf_filter_no')}</option>
			</select>`;
		};

		const getDateInputHtml = (isDateTime) => {
			if (operator.operatorType === OafOperatorType.Comparison) {
				return html`
					<input
						type=${isDateTime ? 'datetime-local' : 'date'}
						.placeholder=${translate('oaf_filter_input_placeholder')}
						class="min-value-input"
						.value=${minValue}
						@input=${(evt) => onMinValueChanged(evt, evt.target.value)}
					/>
					<input
						type=${isDateTime ? 'datetime-local' : 'date'}
						.placeholder=${translate('oaf_filter_input_placeholder')}
						class="max-value-input"
						.value=${maxValue}
						@input=${(evt) => onMaxValueChanged(evt, evt.target.value)}
					/>
				`;
			}

			return html`<div data-type=${OafQueryableType.DATE}>
				<input
					type=${isDateTime ? 'datetime-local' : 'date'}
					class="value-input"
					.placeholder=${translate('oaf_filter_input_placeholder')}
					.value=${value}
					@input=${(evt) => onValueChanged(evt, evt.target.value)}
				/>
			</div>`;
		};

		const getInputHtml = () => {
			const content = () => {
				switch (queryable.type) {
					case OafQueryableType.STRING:
						return getStringInputHtml();
					case OafQueryableType.INTEGER:
					case OafQueryableType.FLOAT:
						return getNumberInputHtml();
					case OafQueryableType.BOOLEAN:
						return getBooleanInputHtml();
					case OafQueryableType.DATE:
						return getDateInputHtml(false);
					case OafQueryableType.DATETIME:
						return getDateInputHtml(true);
				}
				return nothing;
			};
			return html`<div>${content()}</div>`;
		};

		const getOperatorHtml = () => {
			return html`
				<div class="input-operator">
					<select id="select-operator" @change=${onOperatorSelect}>
						${operators.map((op) => html`<option .selected=${op.name === operator.name} .value=${op.name}>${translate(op.translationKey)}</option>`)}
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
					<span title=${queryable.description ?? nothing} class="title">${queryable.title ? queryable.title : queryable.id}</span>
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
		this._updateValue(value, this.getModel().value, Update_Value);
	}

	get value() {
		const value = this.getModel().value;
		return this._parseValue(value, null);
	}

	set maxValue(value) {
		this._updateValue(value, this.getModel().maxValue, Update_Max_Value);
	}

	get maxValue() {
		const maxValue = this.getModel().maxValue;
		return this._parseValue(maxValue, null);
	}

	set minValue(value) {
		this._updateValue(value, this.getModel().minValue, Update_Min_Value);
	}

	get minValue() {
		const minValue = this.getModel().minValue;
		return this._parseValue(minValue, null);
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

	_validateField(field) {
		field.setCustomValidity('');

		if (field.checkValidity()) {
			return true;
		}

		// Validation Failed -> Set messages and report error to user.
		const validityState = field.validity;

		const getMessage = () => {
			const translate = (key, params) => this.#translationService.translate(key, params);
			const valueString = this.queryable.values.slice(0, 3).join(', ');

			if (validityState.patternMismatch) {
				return `${translate('oaf_filter_pattern_validation_msg', [valueString])}`;
			}

			return '';
		};
		field.setCustomValidity(getMessage());
		return field.reportValidity();
	}

	_updateValue(newValue, oldValue, signal) {
		const parsedValue = this._parseValue(newValue, oldValue);
		this.signal(signal, parsedValue);
		return parsedValue;
	}

	_parseValue(value, fallback) {
		const type = this.queryable.type;

		switch (type) {
			case OafQueryableType.INTEGER:
				if (value === '') {
					return '';
				}
				value = parseInt(value);
				return isNumber(value) ? value : fallback;

			case OafQueryableType.FLOAT:
				if (value === '') {
					return '';
				}
				value = parseFloat(value);
				return isNumber(value) ? value : fallback;

			case OafQueryableType.BOOLEAN:
				if (isString(value)) {
					return value.toLowerCase() === 'true';
				}

				return value === true;

			case OafQueryableType.STRING:
				return isString(value) ? value : '';

			default:
				return value;
		}
	}

	static get tag() {
		return 'ba-oaf-filter';
	}
}
