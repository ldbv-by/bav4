import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapFeedbackPanel.css';

const Update_Category = 'update_category';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';
const Update_CategoryOptions = 'update_categoryoptions';
const Update_Geometry_Id = 'update_geometry_id';
// todo remove before pull request ...
const Update_Geometry_Error_Display = 'update_geometry_error_display';
// ... todo remove before pull request

export class MapFeedbackPanel extends MvuElement {
	constructor() {
		super({
			mapFeedback: {
				state: '',
				category: '',
				description: '',
				email: '',
				fileId: null
			},
			categoryOptions: [],
			// todo remove before pull request ...
			geometryErrorDisplay: 'none'
			// ... todo remove before pull request
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			MapFeedbackService: mapFeedbackService
		} = $injector.inject('ConfigService', 'TranslationService', 'MapFeedbackService');

		this._configService = configService;
		this._translationService = translationService;
		this._mapFeedbackService = mapFeedbackService;
	}

	onInitialize() {
		this._getCategorieOptions();
	}

	async _getCategorieOptions() {
		try {
			const categorieOptions = await this._mapFeedbackService.getCategories();
			this.signal(Update_CategoryOptions, categorieOptions);
		} catch (e) {
			console.error(e);
			this.signal(Update_CategoryOptions, []);
		}
	}

	async _saveMapFeedback(mapFeedback) {
		try {
			await this._mapFeedbackService.save(mapFeedback);
		} catch (e) {
			console.error(e);
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
			// todo remove before pull request
			case Update_Geometry_Error_Display:
				return { ...model, geometryErrorDisplay: data };
			// todo remove before pull request
		}
	}

	// todo remove before pull request ...
	hasValidGeometry(geometryIsValid) {
		if (geometryIsValid) {
			this.signal(Update_Geometry_Error_Display, 'none');
			return true;
		}
		this.signal(Update_Geometry_Error_Display, 'block');
		return false;
	}
	// ... todo remove before pull request

	toggleFileId(id) {
		this.signal(Update_Geometry_Id, id);
	}

	createView(model) {
		// todo remove before pull request: geometryErrorDisplay
		const { mapFeedback, categoryOptions, geometryErrorDisplay } = model;

		// todo uncomment before pull request ...
		// let geometryErrorDisplay = 'none';
		// if (mapFeedback.fileId !== null) {
		// 	geometryErrorDisplay = 'block';
		// }
		// ... todo uncomment before pull request

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
			const geometryIsValid = mapFeedback.fileId !== null;
			// todo remove before pull request ...
			this.hasValidGeometry(geometryIsValid);
			// ... todo remove before pull request

			const category = this.shadowRoot.getElementById('category');
			const description = this.shadowRoot.getElementById('description');
			const email = this.shadowRoot.getElementById('email');
			if (geometryIsValid && isValidCategory(category) && isValidDescription(description) && isValidEmail(email)) {
				this._saveMapFeedback(mapFeedback);
			}
		};

		// todo remove before pull request ...
		const onToggle = (event) => {
			let id = null;
			if (event.detail.checked) {
				id = '123';
			}
			this.toggleFileId(id);
		};
		// ... todo remove before pull request

		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanelTitle">${translate('feedback_header')}</h2>

			<div class="feedback-form-container">
				<div class="feedback-form-left">
					<div class="ba-form-element">
						<label for="category" class="control-label">${translate('feedback_categorySelection')}</label>
						<select id="category" name="category" .value="${mapFeedback.category}" @change="${handleCategoryChange}" required>
							${categoryOptions.map((option) => html` <option value="${option}">${option}</option> `)}
						</select>
						<label class="helper-label error-label">Helper text error</label>
					</div>

					<div class="ba-form-element">
						<label for="description" class="control-label">${translate('feedback_changeDescription')}</label>
						<textarea id="description" name="description" .value="${mapFeedback.description}" @input="${handleDescriptionChange}" required></textarea>
					</div>

					<div class="ba-form-element">
						<label for="email" class="control-label">${translate('feedback_eMail')}</label>
						<input type="email" id="email" name="email" placeholder="email" .value="${mapFeedback.email}" @input="${handleEmailChange}" />

						<i class="bar"></i>
						<label class="helper-label error-label">Helper text error</label>
					</div>

					<div class="ba-form-element">
						${translate('feedback_disclaimer')} (<a
							href="https://geoportal.bayern.de/bayernatlas/?lang=de&topic=ba&catalogNodes=11&bgLayer=atkis&layers=timLayer#"
							>${translate('feedback_privacyPolicy')}</a
						>).
					</div>

					<div class="ba-form-element" style="margin-bottom: 10px; display: ${geometryErrorDisplay};">
						<label style="color: red; ">${translate('feedback_pleaseSelect')}</label>
					</div>

					<ba-button id="button0" .label=${'Senden'} .type=${'primary'} @click=${handleSubmit} />
				</div>
				<div class="feedback-form-right">
					<div style="margin-bottom: 10px;">todo remove before pull request - set fileId</div>
					<ba-toggle id="toggle" .title=${'Toggle'} @toggle=${onToggle}></ba-toggle>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
