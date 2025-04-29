/**
 * @module modules/examples/ogc/components/OgcFeatureRow
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './oafRow.css';

const Update_Filter = 'update_filter';

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
			case Update_Filter:
				return { ...model, filter: data };
		}
	}

	createView(model) {
		const { name, type, values, finalList } = model.filter;
		const removeRowEvent = (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			this.dispatchEvent(new CustomEvent('removeRow', { detail: model.filter }));
		};

		const getInputHTML = (type) => {
			const content = () => {
				if (finalList) {
					switch (type) {
						case 'string': {
							return html`
								<select>
									${values.map((value) => html`<option value="${value}">${value}</option>`)}
								</select>
							`;
						}
						case 'integer': {
							return html`
								<div class="flex-container row">
									<input type="range" />
								</div>
								<div class="flex-container row">
									<input type="number" step="1" min="0" max="3000" value="0" />
									<input type="number" step="1" min="0" max="3000" value="3000" />
								</div>
							`;
						}
						case 'float': {
							return html`
								<div class="flex-container row">
									<input type="range" />
								</div>
								<div class="flex-container row">
									<input type="number" step="0.1" min="0" max="100" value="0" />
									<input type="number" step="0.1" min="0" max="100" value="100" />
								</div>
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
					case 'integer': {
						return html`
							<div class="flex-container row">
								<input type="number" step="1" min="0" value="0" />
								<input type="number" step="1" min="0" value="50" />
							</div>
						`;
					}

					case 'float': {
						return html`
							<div class="flex-container row">
								<input type="number" step="0.1" min="0" value="0" />
								<input type="number" step="0.1" min="0" value="50" />
							</div>
						`;
					}
				}

				return html``;
			};

			return html`<div class="flex-container column">${content()}</div>`;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="ogc-filter-row">
				<div>
					<h3>${name}</h3>
					<button @click=${removeRowEvent}>Remove Filter</button>
				</div>
				${getInputHTML(type)}
			</div>
		`;
	}

	set filter(value) {
		this.signal(Update_Filter, value);
	}

	static get tag() {
		return 'ba-oaf-row';
	}
}
