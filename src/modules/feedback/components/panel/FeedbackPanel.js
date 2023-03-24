import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './feedbackPanel.css';

const Update_EMail = 'update_email';
const Update_Topic = 'update_topic';

export class FeedbackPanel extends MvuElement {
	constructor() {
		super({
			age: 21,
			topic: 'one text',
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
			case Update_Topic:
				return { ...model, topic: data };
			case Update_EMail:
				return { ...model, email: data };
		}
	}

	createView(model) {
		const { email, topic, message, age } = model;

		const handleTopicChange = (event) => {
			const { value } = event.target;
			this.signal(Update_Topic, value);
		};

		const handleEmailChange = (event) => {
			const { value } = event.target;
			this.signal(Update_EMail, value);
		};

		const _handleInputChange = (event) => {
			const { name, value } = event.target;
			console.log('🚀 ~ todo: handle ', name, value);
		};

		const handleSubmit = (event) => {
			event.preventDefault();
			const formdata = new FormData(event.target);
			const data = Object.fromEntries(formdata.entries());
			console.log('🚀 ~ FeedbackPanel ~ handleSubmit ~ data:', data);
			// this.dispatchEvent(new CustomEvent('my-form-submit', { detail: data }));
		};

		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanel">Feedback</h2>

			<div class="feedback-form-container">
				<div class="feedback-form-left">
					<form @submit="${handleSubmit}">
						<label for="topic">Topic:</label>
						<input type="text" id="topic" name="topic" .value="${topic}" @input="${handleTopicChange}" required />

						<label for="email">Email:</label>
						<input type="email" id="email" name="email" .value="${email}" @input="${handleEmailChange}" required />

						<label for="message">Message:</label>
						<textarea id="message" name="message" .value="${message}" @input="${_handleInputChange}" required></textarea>

						<label for="age">Age:</label>
						<input type="number" id="age" name="age" .value="${age}" @input="${_handleInputChange}" required />

						<button type="submit">Submit</button>
					</form>
				</div>
				<div class="feedback-form-right">
					<p>Topic: ${topic}</p>
					<p>Email: ${email}</p>
					<p></p>
					<p></p>
					<p></p>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
