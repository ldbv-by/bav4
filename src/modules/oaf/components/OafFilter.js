/**
 * @module modules/examples/ogc/components/OafRow
 */
import { html } from 'lit-html';
import { when } from 'lit-html/directives/when.js';
import { MvuElement } from '../../MvuElement';
import css from './oafFilter.css';

const Update_Filter = 'update_filter';
const Update_Operator = 'update_operator';

/**
 * UX prototype implementation for ogc feature api filtering.
 *
 * @class
 * @author herrmutig
 */
export class OafRow extends MvuElement {
	constructor() {
		super({
			filter: {},
			operator: 'equals'
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Filter:
				return { ...model, filter: data };
			case Update_Operator:
				return { ...model, operator: data };
		}
	}

	createView(model) {
		const { name, type, values, finalList } = model.filter;
		const operator = model.operator;

		const onRemoveRow = (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			this.dispatchEvent(new CustomEvent('removeRow', { detail: model.filter }));
		};

		const onOperatorSelect = (evt) => {
			this.signal(Update_Operator, evt.target.value);
		};

		const operators = this._getOperators(type);
		const getInputHTML = () => {
			const content = () => {
				const step = type == 'integer' ? '1' : '0.1';

				if (finalList) {
					switch (type) {
						case 'string': {
							return html`
								<select>
									${values.map((value) => html`<option value="${value}">${value}</option>`)}
								</select>
							`;
						}
					}
				}

				switch (type) {
					case 'boolean': {
						return html`
							<div class="flex-container row">
								<input type="checkbox" />
							</div>
						`;
					}
					case 'string': {
						return html` <input type="text" /> `;
					}
					case 'float':
					case 'integer': {
						return html`
							<div class="flex-container row">
								${when(
									operator == 'between',
									() => html`
										<input type="number" .step=${step} min="0" max="3000" value="0" />
										<input type="number" .step=${step} min="0" max="3000" value="3000" />
									`,
									() => html`<input type="number" .step=${step} value="3000" />`
								)}
							</div>
						`;
					}
				}

				return html``;
			};

			return html`${content()}`;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="ogc-filter-row">
				<div class="grid-row">
					<div class="grid-column-header">
						<div class="input-filter"><span>${name}</span></div>
						<button @click=${onRemoveRow}>X</button>
					</div>
					<div class="grid-column">
							<div class="input-operator">
								<select @change=${onOperatorSelect}>
									${operators.map((op) => html`<option .selected=${op == operator} .value=${op}>${op}</option>`)}
								</select>
							</div>
							<div class="input-value">${getInputHTML()}</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	set filter(value) {
		this.signal(Update_Filter, value);
	}

	_getOperators(type) {
		const defaultOps = ['equals', 'not equals'];

		switch (type) {
			case 'float':
			case 'integer': {
				return [...defaultOps, 'greater', 'lesser', 'between'];
			}
		}

		return defaultOps;
	}

	static get tag() {
		return 'ba-oaf-filter';
	}
}
