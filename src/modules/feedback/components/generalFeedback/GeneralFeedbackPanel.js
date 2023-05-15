/**
 * @module modules/feedback/components/generalFeedback/GeneralFeedbackPanel
 */
/**
 * @module modules/feedback/components/generalFeedback/GeneralFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { Rating } from '../rating/FiveButtonRating';
import css from './generalFeedbackPanel.css';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../utils/markup';

const Update_Rating = 'update_rating';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';

/**
 * Contains a form for submitting a general feedback.
 * @class
 */
export class GeneralFeedbackPanel extends MvuElement {
	/**
	 * Represents a general feedback form.
	 * @constructor
	 */
	constructor() {
		super({
			generalFeedback: {
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

		const onRatingChange = (event) => {
			const {
				detail: { rating }
			} = event;

			this.signal(Update_Rating, this._securityService.sanitizeHtml(rating));
		};

		const handleEmailChange = (event) => {
			const { value, parentNode } = event.target;
			this._addVisitedClass(parentNode);

			this.signal(Update_EMail, this._securityService.sanitizeHtml(value));
		};

		const onDescriptionChange = (event) => {
			const { value, parentNode } = event.target;
			this._addVisitedClass(parentNode);

			this.signal(Update_Description, this._securityService.sanitizeHtml(value));
		};

		const handleSubmit = () => {
			this.shadowRoot.querySelectorAll('.ba-form-element').forEach((el) => el.classList.add(BA_FORM_ELEMENT_VISITED_CLASS));

			const descriptionElement = this.shadowRoot.getElementById('description');
			const emailElement = this.shadowRoot.getElementById('email');

			if (descriptionElement.reportValidity() && emailElement.reportValidity()) {
				this._saveGeneralFeedback(generalFeedback);
			}
		};

		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanelTitle">${translate('feedback_generalFeedback_header')}</h2>

			<div class="ba-form-element">
				<label for="rating" class="control-label">${translate('feedback_generalFeedback_rating')}</label>
				<ba-mvu-fivebuttonrating
					class="ba-mvu-fivebuttonrating"
					id="rating"
					@rating="${onRatingChange}"
					placeholder="${translate('feedback_generalFeedback_rating')}"
				>
				</ba-mvu-fivebuttonrating>
			</div>

			<div class="ba-form-element">
				<label for="description" class="control-label">${translate('feedback_generalFeedback_changeDescription')}</label>
				<textarea
					type="text"
					id="description"
					placeholder="${translate('feedback_generalFeedback_changeDescription')}"
					.value="${generalFeedback.description}"
					@input="${onDescriptionChange}"
					required
				></textarea>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">${translate('feedback_generalFeedback_changeDescription_helper')}</label>
				<label class="error-label">${translate('feedback_generalFeedback_changeDescription_error')}</label>
			</div>

			<div class="ba-form-element">
				<input
					type="email"
					id="email"
					placeholder="${translate('feedback_generalFeedback_eMail')}"
					.value="${generalFeedback.email}"
					@input="${handleEmailChange}"
				/>
				<label for="email" class="control-label">${translate('feedback_generalFeedback_eMail')}</label>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">${translate('feedback_generalFeedback_eMail_helper')}</label>
				<label class="error-label">${translate('feedback_generalFeedback_eMail_error')}</label>
			</div>

			<p id="feedback_mapFeedback_disclaimer" class="map-feedback__disclaimer" id="mapFeedback_disclaimer">
				${translate('feedback_mapFeedback_disclaimer')} (<a href="${translate('global_privacy_policy_url')}" target="_blank"
					>${translate('feedback_mapFeedback_privacyPolicy')}</a
				>).
			</p>

			<ba-button id="button0" .label=${'Senden'} .type=${'primary'} @click=${handleSubmit} />
		`;
	}

	async _saveGeneralFeedback(generalFeedback) {
		// const translate = (key) => this._translationService.translate(key);
		// try {
		// 	await this._generalFeedbackService.save(generalFeedback);
		emitNotification(JSON.stringify(generalFeedback), LevelTypes.INFO);
		// } catch (e) {
		// 	console.error(e);
		// 	emitNotification(translate('feedback_could_not_save'), LevelTypes.ERROR);
		// }
	}

	_addVisitedClass(element) {
		element.classList.add(BA_FORM_ELEMENT_VISITED_CLASS);
	}

	static get tag() {
		return 'ba-mvu-generalfeedbackpanel';
	}
}
