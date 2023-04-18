/**
 * @module modules/examples/components/MvuListItem
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import topicItemCss from './mvuListItem.css';
import css from '../../commons/components/button/button.css';

const Update_Label = 'Update_Label';

/**
 * Example of an item element.
 *
 * @class
 * @author costa_gi
 */
export class MvuListItem extends MvuElement {
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
			<style>
				${css}
			</style>
			<style>
				${topicItemCss}
			</style>
			<span class="ba-topic-label">${label}</span>
			<button class="ba-topic-button listItemBbutton" @click=${fireEvent}>remove</button>
			<ba-button id="topic-item-button" class="button" .label="remove" @click=${fireEvent}></ba-button>
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
