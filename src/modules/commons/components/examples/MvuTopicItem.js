import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';

const Update_Label = 'Update_Label';

export class MvuTopicItem extends MvuElement {

	constructor() {
		super({
			label: 'initial_label'
		});
	}

	update(type, data, model) {

		switch (type) {
			case Update_Label:
				return { ...model, label: data };
		}
	}

	createView(model) {
		const { label } = model;

		// we want to disable the default HTML 'onClick' event in order to use the custom event 'remove'
		const fireEvent = (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			this.dispatchEvent(new CustomEvent('remove', { detail: this.label }));
		};

		return html`
			<span class='ba-topic-label'>${label}</span>
			<button class='ba-topic-button' @click=${fireEvent}>remove</button>
			`;
	}

	static get tag() {
		return 'ba-mvu-topic-item';
	}

	/**
	* @property {string} label='' - Label of the component
	*/
	set label(value) {
		this.signal(Update_Label, value);
	}

	get label() {
		return this.getModel().label;
	}
}
