/* eslint-disable no-console */
// todo remove
/**
 * @module modules/feedback/components/generalFeedback/GeneralFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { Rating } from '../rating/FiveButtonRating';
import css from './generalFeedbackPanel.css';

const Update_Rating = 'update_rating';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';

const User_Visited_Class = 'userVisited';

export class GeneralFeedbackPanel extends MvuElement {
	constructor() {
		super({
			generalFeedback: {
				state: '',
				description: '',
				rating: Rating.NONE,
				email: ''
			}
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			SecurityService: securityService
		} = $injector.inject('ConfigService', 'TranslationService', 'SecurityService');

		this._configService = configService;
		this._translationService = translationService;
		this._securityService = securityService;
	}

	async _saveGeneralFeedback(generalFeedback) {
		// const translate = (key) => this._translationService.translate(key);
		// try {
		// 	await this._generalFeedbackService.save(generalFeedback);
		emitNotification(generalFeedback, LevelTypes.INFO);
		// } catch (e) {
		// 	console.error(e);
		// 	emitNotification(translate('feedback_could_not_save'), LevelTypes.ERROR);
		// }
	}

	update(type, data, model) {
		switch (type) {
			case Update_Description:
				return { ...model, generalFeedback: { ...model.generalFeedback, description: data } };
			case Update_EMail:
				return { ...model, generalFeedback: { ...model.generalFeedback, email: data } };
			case Update_Rating:
				return { ...model, generalFeedback: { ...model.generalFeedback, rating: data } };
		}
	}

	createView(model) {
		const { generalFeedback } = model;

		const translate = (key) => this._translationService.translate(key);

		const handleRatingChange = (event) => {
			const {
				detail: { rating }
			} = event;
			console.log('🚀 ~ GeneralFeedbackPanel ~ handleRatingChange ~ rating:', rating);

			const ratingElement = this.shadowRoot.getElementById('rating-form-element');
			ratingElement.classList.add(User_Visited_Class);

			this.signal(Update_Rating, this._securityService.sanitizeHtml(rating));

			this._setRatingAttribute(rating);
		};

		const handleEmailChange = (event) => {
			const emailFormElement = this.shadowRoot.getElementById('email-form-element');
			emailFormElement.classList.add(User_Visited_Class);

			const { value } = event.target;
			this.signal(Update_EMail, this._securityService.sanitizeHtml(value));
		};

		const handleDescriptionChange = (event) => {
			const descriptionFormElement = this.shadowRoot.getElementById('description-form-element');
			descriptionFormElement.classList.add(User_Visited_Class);

			const { value } = event.target;
			this.signal(Update_Description, this._securityService.sanitizeHtml(value));
		};

		const isValidRating = (rating) => {
			console.log('🚀 ~ GeneralFeedbackPanel ~ isValidRating ~ rating:', rating);
			const ratingValid = rating.reportValidity();
			console.log('🚀 ~ GeneralFeedbackPanel ~ isValidRating ~ ratingValid:', ratingValid);
			return ratingValid;
		};

		const isValidDescription = (description) => {
			return description.reportValidity();
		};

		const isValidEmail = (email) => {
			console.log('🚀 ~ GeneralFeedbackPanel ~ isValidEmail ~ email:', email);
			return email.reportValidity();
		};

		const handleSubmit = () => {
			this._allBaFormElements().forEach((element) => {
				console.log('🚀 ~ GeneralFeedbackPanel ~ this._allBaFormElements ~ element:', element);
				element.classList.add(User_Visited_Class);
			});

			this._setRatingAttribute();
			this.render();

			const ratingElement = this.shadowRoot.getElementById('rating');
			const descriptionElement = this.shadowRoot.getElementById('description');
			const emailElement = this.shadowRoot.getElementById('email');

			// const ratingValidationMessage = this.shadowRoot.getElementById('rating-validation-message');
			// const ratingElement = this.shadowRoot.getElementById('rating');
			// const ratingIsValid = isValidRating(ratingElement);
			// if (!ratingIsValid) {
			// 	const parent = ratingElement.parentElement;
			// 	console.log('🚀 ~ GeneralFeedbackPanel ~ handleSubmit ~ parent:', parent);
			// 	// rating.invalidate();
			// 	ratingValidationMessage.style.display = 'block';
			// 	return;
			// }

			if (isValidRating(ratingElement) && isValidDescription(descriptionElement) && isValidEmail(emailElement)) {
				this._saveGeneralFeedback(generalFeedback);
			}
		};

		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanelTitle">${translate('feedback_generalfeedback_header')}</h2>

			<div class="ba-form-element" id="rating-form-element">
				<label for="rating" class="control-label">${translate('feedback_generalfeedback_rating')}</label>
				<ba-mvu-fivebuttonrating
					class="ba-mvu-fivebuttonrating"
					id="rating"
					@rating="${handleRatingChange}"
					placeholder="${translate('feedback_generalfeedback_rating')}"
					.value="${generalFeedback.rating}"
					style="margin-bottom: 20px;"
				>
				</ba-mvu-fivebuttonrating>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">Helper text</label>
				<label class="error-label">Error text</label>

				<div id="rating-validation-message" class="error-message"></div>
			</div>

			<div class="ba-form-element" id="description-form-element">
				<label for="description" class="control-label">${translate('feedback_generalfeedback_changeDescription')}</label>
				<textarea
					type="text"
					id="description"
					placeholder="${translate('feedback_generalfeedback_changeDescription')}"
					.value="${generalFeedback.description}"
					@input="${handleDescriptionChange}"
					required
				></textarea>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">Helper text</label>
				<label class="error-label">Error text</label>
			</div>

			<div class="ba-form-element" id="email-form-element">
				<input
					type="email"
					id="email"
					placeholder="${translate('feedback_generalfeedback_eMail')}"
					.value="${generalFeedback.email}"
					@input="${handleEmailChange}"
				/>
				<label for="email" class="control-label">${translate('feedback_generalfeedback_eMail')}</label>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">Helper text</label>
				<label class="error-label">Error text</label>
			</div>

			<p id="feedback_mapFeedback_disclaimer" class="map-feedback__disclaimer" id="mapFeedback_disclaimer">
				${translate('feedback_mapFeedback_disclaimer')} (<a href="${translate('global_privacy_policy_url')}" target="_blank"
					>${translate('feedback_mapFeedback_privacyPolicy')}</a
				>).
			</p>

			<ba-button id="button0" .label=${'Senden'} .type=${'primary'} @click=${handleSubmit} />
		`;
	}

	_setRatingAttribute(rating) {
		const ratingElement = this.shadowRoot.getElementById('rating');
		console.log('🚀 ~ GeneralFeedbackPanel ~ _setRatingAttribute ~ ratingElement:', ratingElement);
		if (rating) {
			console.log('🚀 ~ GeneralFeedbackPanel ~ _setRatingAttribute ~ rating:', rating);

			if (rating === '0') {
				ratingElement.setAttribute('invalid-rating', 'true');
				console.log("setAttribute('invalid-rating', 'true')");
			} else {
				ratingElement.removeAttribute('invalid-rating');
				console.log("removeAttribute('invalid-rating')");
			}
			return;
		}

		console.log('🚀 ~ GeneralFeedbackPanel ~ _setRatingAttribute ~ ratingElement.value:', ratingElement.value);
		if (ratingElement.value === '0') {
			ratingElement.setAttribute('invalid-rating', 'true');
			console.log("setAttribute('invalid-rating',  'true')");
		} else {
			ratingElement.removeAttribute('invalid-rating');
			console.log("removeAttribute('invalid-rating')");
		}
	}

	_allBaFormElements() {
		const allElements = [];
		allElements.push(...this.shadowRoot.querySelectorAll('.ba-form-element'));
		return allElements;
	}

	static get tag() {
		return 'ba-mvu-generalfeedbackpanel';
	}
}
