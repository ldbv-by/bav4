import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapFeedbackPanel.css';

const Update_EMail = 'update_email';
const Update_Topic = 'update_topic';
const Update_Reason = 'update_reason';
//const Update_Topic = 'update_topic';
const Update_Category = 'update_category';
const Update_CategoryOptions = 'update_categoryoptions';

export class MapFeedbackPanel extends MvuElement {
	constructor() {
		super({
			age: '',
			topic: '',
			message: '',
			email: '',
			reason: '',
			category: '',
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

		// this.categoryOptions = [
		// 	{ value: '', label: 'Bitte wählen ...' },
		// 	{ value: 'trafic', label: 'Verkehr' },
		// 	{ value: 'settlement', label: 'Siedlung' },
		// 	{ value: 'waters', label: 'Gewässer' },
		// 	{ value: 'label', label: 'Beschriftung' },
		// 	{ value: 'poi', label: 'Points of Interest' },
		// 	{ value: 'other', label: 'sonstiges' }
		// ];

		this.reasonOptions = [
			{ value: '', label: '-' },
			{ value: 'missing', label: 'Missing' },
			{ value: 'wrong type', label: 'Wrong Type' },
			{ value: 'error', label: 'Error' }
		];
	}

	onInitialize() {
		this._getCategorieOptions();
		// this._unsubscribers = [
		// 	this.observe(
		// 		(state) => state.media.darkSchema,
		// 		(darkSchema) => this.signal(Update_Schema, darkSchema)
		// 	)
		// ];
		// this._unsubscribers = [
		// 	this.observe(
		// 		(state) => state.media,
		// 		(data) => this.signal(Update_Media, data),
		// 		true
		// 	)
		// ];
	}

	async _getCategorieOptions() {
		try {
			const categorieOptions = await this._mapFeedbackService.getCategories();
			console.log('🚀 ~ MapFeedbackPanel ~ _getCategorieOptions ~ categorieOptions:', categorieOptions);
			this.signal(Update_CategoryOptions, categorieOptions);
		} catch (e) {
			console.error(e);
			this.signal(Update_CategoryOptions, null);
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_Topic:
				return { ...model, topic: data };
			case Update_EMail:
				return { ...model, email: data };
			case Update_Reason:
				return { ...model, reason: data };
			case Update_Category:
				return { ...model, category: data };
			case Update_CategoryOptions:
				return { ...model, categoryOptions: data };
		}
	}

	createView(model) {
		const { email, message, category, categoryOptions } = model;

		// const selectedCategory = this.categoryOptions.find((aCategory) => {
		// 	return aCategory.value === category;
		// });

		// const handleTopicChange = (event) => {
		// 	const { value } = event.target;
		// 	this.signal(Update_Topic, value);
		// };

		const handleEmailChange = (event) => {
			// console.log('🚀 ~ FeedbackPanel ~ handleEmailChange ');
			const { value } = event.target;
			this.signal(Update_EMail, value);
		};

		// const handleReasonChange = (event) => {  @input="${handleReasonChange}
		// 	const { value } = event.target;
		// 	this.signal(Update_Reason, value);
		// };

		const onChangeCategory = () => {
			this._noAnimation = true;
			const select = this.shadowRoot.getElementById('category');
			const selectedCategory = select.options[select.selectedIndex].value;
			// console.log('🚀 ~ FeedbackPanel ~ onChange ~ selectedCategory:', selectedCategory);
			this.signal(Update_Category, selectedCategory);
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
			this.dispatchEvent(new CustomEvent('feedback-form-submit', { detail: data }));
		};

		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanelTitle">Feedback zur Karte</h2>

			<div class="feedback-form-container">
				<div class="feedback-form-left">
					<form @submit="${handleSubmit}">
						<br />
						<label>1. Markierung Ihrer Änderungsmeldung</label>
						<div>
							<input type="radio" id="symbol" name="type" value="symbol" @change="${this._handleTypeChange}" />
							<label for="symbol">Symbol</label>
						</div>
						<div>
							<input type="radio" id="line" name="type" value="line" @change="${this._handleTypeChange}" />
							<label for="line">Line</label>
						</div>
						<br />

						<label for="category">2. Auswahl der Kategorie</label>
						<select id="category" name="category" .value="${category}" @change="${onChangeCategory}" required>
							${categoryOptions.map((option) => html` <option value="${option.value}">${option.label}</option> `)}
						</select>

						<label for="message">3. Beschreibung der Änderung</label>
						<textarea
							id="message"
							name="message"
							.value="${message}"
							@input="${_handleInputChange}"
							minlength="10"
							maxlength="40"
							required
						></textarea>

						<label for="email">4. Ihre E-Mail-Adresse</label>
						<input type="email" id="email" name="email" .value="${email}" @input="${handleEmailChange}" required />
						<br />

						Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere
						Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse (<a
							href="https://geoportal.bayern.de/bayernatlas/?lang=de&topic=ba&catalogNodes=11&bgLayer=atkis&layers=timLayer#"
							>Hinweis zum Datenschutz</a
						>).
						<br />

						<button type="submit">Submit</button>
					</form>
				</div>
				<div class="feedback-form-right"></div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
