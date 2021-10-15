import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';

const Update_Label = 'Update_Label';

export class MvuTopicItem extends MvuElement {

	constructor() {
		super({
			label: 'intilal_label'
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

		return html`
			<span class='ba-topic-label'>${label}</span>
			<button class='ba-topic-button'>remove</button>
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
