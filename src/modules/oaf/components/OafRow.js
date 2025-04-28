/**
 * @module modules/examples/ogc/components/OgcFeatureRow
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafRow.css';

const Update_filter = 'update_filter';

/**
 * UX prototype implementation for ogc feature api filtering.
 *
 * @class
 * @author badeniji
 */
export class OafRow extends MvuElement {
	constructor() {
		super({
			filter: {}
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_filter:
				return { ...model, filter: data };
		}
	}

	createView(model) {
		const { label, type, min, max, values } = model.filter;
		const removeRowEvent = (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			this.dispatchEvent(new CustomEvent('removeRow', { detail: model.filter }));
		};

		const getInputHTML = (type) => {
			switch (type) {
				case 'string':
					const stringTypeContent = values
						? html`
								<select>
									${values.map((value) => html`<option value="${value}">${value}</option>`)}
								</select>
							`
						: html` <input type="text" /> `;
					return html`<div class="flex-container column">${stringTypeContent}</div>`;
				case 'int':
					return html`
						<div class="flex-container column">
							<div class="flex-container row">
								<input type="range" />
							</div>
							<div class="flex-container row">
								<input type="number" step="1" min=${min} max=${max} value=${min} />
								<input type="number" step="1" min=${min} max=${max} value=${max} />
							</div>
						</div>
					`;
				case 'float':
					return html`
						<div class="flex-container column">
							<div class="flex-container row">
								<input type="range" />
							</div>
							<div class="flex-container row">
								<input type="number" step="0.1" min=${min} max=${max} value=${min} />
								<input type="number" step="0.1" min=${min} max=${max} value=${max} />
							</div>
						</div>
					`;
				case 'date':
					return html`
						<div class="flex-container column">
							<div class="flex-container row">
								<input type="date" />
							</div>
						</div>
					`;
				case 'bool':
					return html`
						<div class="flex-container column">
							<div class="flex-container row">
								<input type="checkbox" />
							</div>
						</div>
					`;
			}

			return html``;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="ogc-filter-row">
				<div>
					<h3>${label}</h3>
					<button @click=${removeRowEvent}>Remove Filter</button>
				</div>
				${getInputHTML(type)}
			</div>
		`;
	}

	set filter(value) {
		this.signal(Update_filter, value);
	}

	static get tag() {
		return 'ba-oaf-row';
	}
}
