import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapFeedbackPanel.css';

const Update_Type = 'update_type';
const Update_Category = 'update_category';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';
const Update_CategoryOptions = 'update_categoryoptions';

export class MapFeedbackPanel extends MvuElement {
	constructor() {
		super({
			mapFeedback: {
				state: '',
				category: '',
				description: '',
				email: '',
				fileId: ''
			},
			categoryOptions: []
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
			case Update_Type:
				return { ...model, type: data };
			case Update_Category:
				return { ...model, mapFeedback: { ...model.mapFeedback, category: data } };
			case Update_Description:
				return { ...model, mapFeedback: { ...model.mapFeedback, description: data } };
			case Update_EMail:
				return { ...model, mapFeedback: { ...model.mapFeedback, email: data } };
			case Update_CategoryOptions:
				return { ...model, categoryOptions: ['', ...data] };
		}
	}

	createView(model) {
		const { mapFeedback, categoryOptions } = model;
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

		const handleSubmit = (event) => {
			console.log('🚀 ~ MapFeedbackPanel ~ handleSubmit ~ event:', event);
			// event.preventDefault();
			this._saveMapFeedback(mapFeedback);
		};

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
					</div>

					<div class="ba-form-element">
						<label for="description" class="control-label">${translate('feedback_changeDescription')}</label>
						<textarea
							id="description"
							name="description"
							.value="${mapFeedback.description}"
							@input="${handleDescriptionChange}"
							minlength="10"
							maxlength="40"
							required
						></textarea>
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

					<ba-button id="button0" .label=${'Senden'} .type=${'primary'} @click=${handleSubmit} />
				</div>
				<div class="feedback-form-right"></div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
