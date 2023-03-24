import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './feedbackPanel.css';

const Update_EMail = 'update_email';
const Update_Topic = 'update_topic';
const Update_Reason = 'update_reason';

export class FeedbackPanel extends MvuElement {
	constructor() {
		super({
			age: 21,
			topic: 'one text',
			message: 'another text',
			email: 'mail@some.com',
			reason: ''
		});

		this.reasonOptions = [
			{ value: '', label: '-' },
			{ value: 'error', label: 'Error' },
			{ value: 'missing', label: 'Missing' },
			{ value: 'wrong type', label: 'Wrong Type' }
		];
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
			case Update_Reason:
				return { ...model, reason: data };
		}
	}

	createView(model) {
		const { email, topic, message, age, reason } = model;

		const selectedReason = this.reasonOptions.find((aReason) => {
			return aReason.value === reason;
		});

		const handleTopicChange = (event) => {
			const { value } = event.target;
			this.signal(Update_Topic, value);
		};

		const handleEmailChange = (event) => {
			const { value } = event.target;
			this.signal(Update_EMail, value);
		};

		const handleReasonChange = (event) => {
			const { value } = event.target;

			this.signal(Update_Reason, value);
		};

		const _handleInputChange = (event) => {
			const { name, value } = event.target;
			// eslint-disable-next-line no-console
			console.log('🚀 ~ todo: handle ', name, value);
		};

		const handleSubmit = (event) => {
			event.preventDefault();
			const formdata = new FormData(event.target);
			const data = Object.fromEntries(formdata.entries());
			// eslint-disable-next-line no-console
			console.log('🚀 ~ FeedbackPanel ~ handleSubmit ~ data:', data);
			// this.dispatchEvent(new CustomEvent('feedback-form-submit', { detail: data }));
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
						<textarea
							id="message"
							name="message"
							.value="${message}"
							@input="${_handleInputChange}"
							minlength="10"
							maxlength="40"
							required
						></textarea>

						<label for="age">Age:</label>
						<input type="number" id="age" name="age" .value="${age}" @input="${_handleInputChange}" required />

						<label for="reason">Reason:</label>
						<select id="reason" name="reason" .value="${reason}" @input="${handleReasonChange}" required>
							${this.reasonOptions.map((option) => html` <option value="${option.value}">${option.label}</option> `)}
						</select>

						<button type="submit">Submit</button>
					</form>
				</div>
				<div class="feedback-form-right">
					<p>Topic: ${topic}</p>
					<p>Email: ${email}</p>
					<p></p>
					<p></p>
					<p>Reason: ${selectedReason?.label}</p>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
