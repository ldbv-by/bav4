/**
 * @module modules/feedback/components/mapFeedback/MapFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapFeedbackPanel.css';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { MapFeedback } from '../../../../services/FeedbackService';

const Update_Category = 'update_category';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';
const Update_CategoryOptions = 'update_categoryoptions';
const Update_Geometry_Id = 'update_geometry_id';
const Remember_Submit = 'remember_submit';

/**
 * Contains a map-iframe and a form for submitting a {@link module:services/MapFeedbackService~MapFeedback}.
 * @class
 */
export class MapFeedbackPanel extends MvuElement {
	constructor() {
		super({
			mapFeedback: {
				state: '',
				category: '',
				description: '',
				email: null,
				fileId: null
			},
			categoryOptions: [],
			submitWasClicked: false
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			FeedbackService: feedbackService
		} = $injector.inject('ConfigService', 'TranslationService', 'FeedbackService');

		this._configService = configService;
		this._translationService = translationService;
		this._feedbackService = feedbackService;
	}

	onInitialize() {
		this._getCategorieOptions();
	}

	async _getCategorieOptions() {
		try {
			const categorieOptions = await this._feedbackService.getCategories();
			this.signal(Update_CategoryOptions, categorieOptions);
		} catch (e) {
			console.error(e);
			this.signal(Update_CategoryOptions, []);
		}
	}

	async _saveMapFeedback(mapFeedback) {
		const translate = (key) => this._translationService.translate(key);
		try {
			await this._feedbackService.save(mapFeedback);
			emitNotification(translate('mapFeedback_saved_successfully'), LevelTypes.INFO);
		} catch (e) {
			console.error(e);
			emitNotification(translate('mapFeedback_could_not_save'), LevelTypes.ERROR);
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_Category:
				return { ...model, mapFeedback: { ...model.mapFeedback, category: data } };
			case Update_Description:
				return { ...model, mapFeedback: { ...model.mapFeedback, description: data } };
			case Update_EMail:
				return { ...model, mapFeedback: { ...model.mapFeedback, email: data } };
			case Update_CategoryOptions:
				return { ...model, categoryOptions: ['', ...data] };
			case Update_Geometry_Id:
				return { ...model, mapFeedback: { ...model.mapFeedback, fileId: data } };
			case Remember_Submit:
				return { ...model, submitWasClicked: data };
		}
	}

	_updateFileId(id) {
		this.signal(Update_Geometry_Id, id);
	}

	createView(model) {
		const { mapFeedback, categoryOptions, submitWasClicked } = model;

		let geometryErrorDisplay = 'none';
		if (submitWasClicked && mapFeedback.fileId === null) {
			geometryErrorDisplay = 'block';
		}
		const translate = (key) => this._translationService.translate(key);

		const handleCategoryChange = () => {
			this._noAnimation = true;
			const select = this.shadowRoot.getElementById('category');
			const selectedCategory = select.options[select.selectedIndex].value;
			this.signal(Update_Category, selectedCategory);
		};

		const handleEmailChange = (event) => {
			const { value } = event.target;
			this.signal(Update_EMail, value);
		};

		const handleDescriptionChange = (event) => {
			const { value } = event.target;
			this.signal(Update_Description, value);
		};

		const isValidCategory = (category) => {
			return category.reportValidity();
		};

		const isValidDescription = (description) => {
			return description.reportValidity();
		};

		const isValidEmail = (email) => {
			return email.reportValidity();
		};

		const handleSubmit = () => {
			this.signal(Remember_Submit, true);

			const category = this.shadowRoot.getElementById('category');
			const description = this.shadowRoot.getElementById('description');
			const email = this.shadowRoot.getElementById('email');
			if (mapFeedback.fileId !== null && isValidCategory(category) && isValidDescription(description) && isValidEmail(email)) {
				this._saveMapFeedback(
					new MapFeedback(mapFeedback.state, mapFeedback.category, mapFeedback.description, mapFeedback.fileId, mapFeedback.email)
				);
			}
		};

		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanelTitle">${translate('mapFeedback_header')}</h2>

			<div class="feedback-form-container">
				<div class="feedback-form-left">
					<div class="ba-form-element">
						<select id="category" .value="${mapFeedback.category}" @change="${handleCategoryChange}" required>
							${categoryOptions.map((option) => html` <option value="${option}">${option}</option> `)}
						</select>
						<label for="category" class="control-label">${translate('mapFeedback_categorySelection')}</label><i class="bar"></i>
					</div>

					<div class="ba-form-element">
						<textarea id="description" .value="${mapFeedback.description}" @input="${handleDescriptionChange}" required placeholder=""></textarea>
						<label for="description" class="control-label">${translate('mapFeedback_changeDescription')}</label>
						<i class="bar"></i>
						<label class="helper-label">Helper text</label>
						<i class="icon error"></i>
					</div>

					<div class="ba-form-element">
						<input type="email" id="email" .value="${mapFeedback.email}" @input="${handleEmailChange}" placeholder="" />
						<label for="email" class="control-label">${translate('mapFeedback_eMail')}</label>
						<i class="bar"></i>
						<i class="icon error"></i>
					</div>

					<div class="ba-form-element" id="mapFeedback_disclaimer">
						${translate('mapFeedback_disclaimer')} (<a href="${translate('global_privacy_policy_url')}">${translate('mapFeedback_privacyPolicy')}</a
						>).
					</div>

					<div class="ba-form-element" style="margin-bottom: 10px; display: ${geometryErrorDisplay};">
						<label style="color: red; ">${translate('mapFeedback_pleaseSelect')}</label>
					</div>

					<ba-button id="button0" .label=${'Senden'} .type=${'primary'} @click=${handleSubmit} />
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
