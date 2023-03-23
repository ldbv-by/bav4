import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './feedbackPanel.css';

const Update_Feedback = 'update_feedback';

export class FeedbackPanel extends MvuElement {
	constructor() {
		super({
			age: 21,
			oneText: 'one text',
			message: 'another text',
			aSelection: ['one', 'two', 'three'],
			selected: 'two',
			email: 'mail@some.com'
		});
	}

	onInitialize() {
		// this._unsubscribers = [
		// 	this.observe(
		// 		(state) => state.media.darkSchema,
		// 		(darkSchema) => this.signal(Update_Schema, darkSchema)
		// 	),
		// 	this.observe(
		// 		(state) => state.elevationProfile.coordinates,
		// 		(coordinates) => this._getElevationProfile(coordinates)
		// 	),
		// 	this.observe(
		// 		(state) => state.media,
		// 		(data) => this.signal(Update_Media, data),
		// 		true
		// 	)
		// ];
	}

	update(type, data, model) {
		switch (type) {
			case Update_Feedback:
				return { ...model, feedback: data };
		}
	}

	createView(model) {
		const { email, oneText, message, age } = model;

		const handleOneTextChange = () => {};

		const _handleInputChange = (event) => {
			const { name, value } = event.target;
			this[name] = value;
		};
		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanel">Feedback</h2>

			<form>
				<label for="name">Name:</label>
				<input type="text" id="name" name="name" .value="${oneText}" @input="${handleOneTextChange}" required />

				<label for="email">Email:</label>
				<input type="email" id="email" name="email" .value="${email}" @input="${_handleInputChange}" required />

				<label for="message">Message:</label>
				<textarea id="message" name="message" .value="${message}" @input="${_handleInputChange}" required></textarea>

				<label for="age">Age:</label>
				<input type="number" id="age" name="age" .value="${age}" @input="${_handleInputChange}" required />

				<button type="submit">Submit</button>
			</form>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
