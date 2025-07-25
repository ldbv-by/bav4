/**
 * @module modules/feedback/components/generalFeedback/GeneralFeedbackPanel
 */

import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import css from './generalFeedbackPanel.css';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../utils/markup';
import { GeneralFeedback } from '../../../../services/FeedbackService';

const Update_Rating = 'update_rating';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';
const Update_State = 'update_state';

const Update_Category = 'update_category';
const Update_CategoryOptions = 'update_categoryoptions';

/**
 * Contains a form for submitting a general feedback.
 * @property {Function} onSubmit
 * @class
 */
export class GeneralFeedbackPanel extends MvuElement {
	constructor() {
		super({
			generalFeedback: {
				category: null,
				description: null,
				email: null,
				rating: null,
				state: null
			},
			categoryOptions: []
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			FeedbackService: feedbackService,
			SecurityService: securityService,
			ShareService: shareService
		} = $injector.inject('ConfigService', 'TranslationService', 'FeedbackService', 'SecurityService', 'ShareService');

		this._configService = configService;
		this._translationService = translationService;
		this._feedbackService = feedbackService;
		this._securityService = securityService;
		this._shareService = shareService;
		this._onSubmit = () => {};
	}

	onInitialize() {
		this._getCategoryOptions();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Description:
				return { ...model, generalFeedback: { ...model.generalFeedback, description: data } };
			case Update_EMail:
				return { ...model, generalFeedback: { ...model.generalFeedback, email: data } };
			case Update_Rating:
				return { ...model, generalFeedback: { ...model.generalFeedback, rating: data } };
			case Update_Category:
				return { ...model, generalFeedback: { ...model.generalFeedback, category: data } };
			case Update_CategoryOptions:
				return { ...model, categoryOptions: ['', ...data] };
			case Update_State:
				return { ...model, generalFeedback: { ...model.generalFeedback, state: data } };
		}
	}

	createView(model) {
		const { generalFeedback, categoryOptions } = model;

		const translate = (key) => this._translationService.translate(key);

		const onRatingChange = (event) => {
			const {
				detail: { rating },
				target: { parentNode }
			} = event;

			this._addVisitedClass(parentNode);
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

		const onCategoryChange = (event) => {
			const selectElement = event.target;
			const selectedCategory = selectElement.options[selectElement.selectedIndex].value;

			this._addVisitedClass(selectElement.parentNode);

			this.signal(Update_Category, this._securityService.sanitizeHtml(selectedCategory));
		};

		const onToggleState = () => {
			this.signal(Update_State, generalFeedback.state ? null : new URL(this._shareService.encodeState()));
		};

		const onSubmit = () => {
			this.shadowRoot.querySelectorAll('.ba-form-element').forEach((el) => el.classList.add(BA_FORM_ELEMENT_VISITED_CLASS));

			const categoryElement = this.shadowRoot.getElementById('category');
			const descriptionElement = this.shadowRoot.getElementById('description');
			const emailElement = this.shadowRoot.getElementById('email');

			if (categoryElement.reportValidity() && descriptionElement.reportValidity() && emailElement.reportValidity()) {
				this._saveGeneralFeedback(
					new GeneralFeedback(
						generalFeedback.category,
						generalFeedback.description,
						generalFeedback.email,
						generalFeedback.rating,
						generalFeedback.state
					)
				);
			}
		};

		return html`
			<style>
				${css}
			</style>

			<div id="feedbackPanelTitle" class="feedback-main-header">${translate('feedback_generalFeedback')}</div>

			<div class="ba-form-element">
				<select id="category" .value="${generalFeedback.category}" @change="${onCategoryChange}" required>
					${categoryOptions.map((option) => html` <option value="${option}">${option}</option> `)}
				</select>
				<label for="category" class="control-label">${translate('feedback_categorySelection')}</label><i class="bar"></i>
				<label class="helper-label">${translate('feedback_categorySelection_helper')}</label>
				<label class="helper-label">${translate('feedback_categorySelection_error')}</label>
			</div>

			<div class="ba-form-element">
				<textarea
					type="text"
					id="description"
					placeholder="${translate('feedback_changeDescription')}"
					.value="${generalFeedback.description}"
					@input="${onDescriptionChange}"
					required
				></textarea>
				<label for="description" class="control-label">${translate('feedback_changeDescription')}</label>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">${translate('feedback_required_field_helper')}</label>
				<label class="error-label">${translate('feedback_required_field_error')}</label>
			</div>

			<div class="ba-form-element">
				<input type="email" id="email" placeholder="${translate('feedback_eMail')}" .value="${generalFeedback.email}" @input="${handleEmailChange}" />
				<label for="email" class="control-label">${translate('feedback_eMail')}</label>
				<i class="bar"></i>
				<i class="icon error"></i>
				<label class="helper-label">${translate('feedback_eMail_helper')}</label>
				<label class="error-label">${translate('feedback_eMail_error')}</label>
			</div>

			<div>
				<ba-checkbox class="map-feedback__checkbox" tabindex="0" @toggle=${onToggleState} .checked=${!!generalFeedback.state}>
					<span class="opt-in-text">${translate('feedback_add_current_state_optionally')}</span>
				</ba-checkbox>
			</div>

			<div class="feedback-header">${translate('feedback_generalFeedback_rating')}</div>
			<div class="ba-form-element">
				<ba-likert-item-rating-panel id="rating" @change="${onRatingChange}"></ba-likert-item-rating-panel>
				<div class="feedback-text-container">
					<span>${translate('feedback_generalFeedback_rating_scale_5')}</span>
					<span>${translate('feedback_generalFeedback_rating_scale_0')}</span>
				</div>
			</div>

			<p id="generalFeedback_disclaimer" class="map-feedback__disclaimer">
				${translate('feedback_generalFeedback_disclaimer')} (<a href="${translate('global_privacy_policy_url')}" target="_blank"
					>${translate('feedback_privacyPolicy')}</a
				>).
			</p>

			<ba-button
				id="button0"
				.label=${translate('feedback_submit')}
				.title=${translate('feedback_generalFeedback_submit_title')}
				.type=${'primary'}
				@click=${onSubmit}
			></ba-button>
		`;
	}

	async _getCategoryOptions() {
		try {
			const categoryOptions = await this._feedbackService.getGeneralFeedbackCategories();
			this.signal(Update_CategoryOptions, categoryOptions);
		} catch (e) {
			console.error(e);
			this.signal(Update_CategoryOptions, []);
		}
	}

	async _saveGeneralFeedback(generalFeedback) {
		const translate = (key) => this._translationService.translate(key);
		const submitButton = this.shadowRoot.getElementById('button0');
		try {
			// @ts-ignore
			submitButton.disabled /**prevent double submit by disabling the button*/ = true;
			await this._feedbackService.save(generalFeedback);
			this._onSubmit();
			emitNotification(translate('feedback_saved_successfully'), LevelTypes.INFO);
		} catch (e) {
			console.error(e);
			emitNotification(translate('feedback_generalFeedback_could_not_save'), LevelTypes.ERROR);
		} finally {
			// @ts-ignore
			submitButton.disabled = false;
		}
	}

	_addVisitedClass(element) {
		element.classList.add(BA_FORM_ELEMENT_VISITED_CLASS);
	}

	/**
	 * Registers a callback function which will be called when the form was submitted successfully.
	 * @type {Function}
	 */
	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	static get tag() {
		return 'ba-mvu-generalfeedbackpanel';
	}
}
