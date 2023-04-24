/**
 * @module modules/feedback/components/mapFeedback/MapFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapFeedbackPanel.css';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { MapFeedback } from '../../../../services/FeedbackService';
import { PathParameters } from '../../../../domain/pathParameters';
import { IFRAME_GEOMETRY_REFERENCE_ID } from '../../../../utils/markup';
import { IFrameComponents } from '../../../../domain/iframeComponents';
import { QueryParameters } from '../../../../domain/queryParameters';

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
			FeedbackService: feedbackService,
			ShareService: shareService
		} = $injector.inject('ConfigService', 'TranslationService', 'FeedbackService', 'ShareService');

		this._configService = configService;
		this._translationService = translationService;
		this._feedbackService = feedbackService;
		this._shareService = shareService;
		this._iframeObserver = null;
	}

	onInitialize() {
		this._getCategoryOptions();
	}

	onAfterRender(firstTime) {
		const onIFrameChanged = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === 'attributes' && mutation.attributeName === IFRAME_GEOMETRY_REFERENCE_ID) {
					const fileId = mutation.target.getAttribute(IFRAME_GEOMETRY_REFERENCE_ID);
					this._updateFileId(fileId);
				}
			}
		};
		if (firstTime) {
			const iframeElement = this.shadowRoot.querySelector('iframe');
			const config = { attributes: true, childList: false, subtree: false };
			this._iframeObserver = new MutationObserver(onIFrameChanged);
			this._iframeObserver.observe(iframeElement, config);
		}
	}

	async _getCategoryOptions() {
		try {
			const categoryOptions = await this._feedbackService.getCategories();
			this.signal(Update_CategoryOptions, categoryOptions);
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

		const getExtraParameters = () => {
			const queryParameters = {};
			queryParameters[QueryParameters.LAYER] = '914c9263-5312-453e-b3eb-5104db1bf788'; // TODO: replace with layer from FeedbackService
			queryParameters[QueryParameters.IFRAME_COMPONENTS] = [IFrameComponents.DRAW_TOOL, IFrameComponents.ACTIVATE_MAP_BUTTON];
			return queryParameters;
		};

		const iframeSrc = this._shareService.encodeState(getExtraParameters(), [PathParameters.EMBED]);
		return html`
			<style>
				${css}
			</style>

			<h2 id="feedbackPanelTitle">${translate('mapFeedback_header')}</h2>

			<div class="feedback-form-container">
				<div class="feedback-form-left">
					<div class="iframe__content">
						<iframe
							data-iframe-geometry-reference-id
							src=${iframeSrc}
							width=100%'
							height=600px'
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
						></iframe>
						${mapFeedback.fileId ? html.nothing : html`<span class="Iframe__hint">${translate('mapFeedback_geometry_missing')}</span>`}
					</div>					

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
