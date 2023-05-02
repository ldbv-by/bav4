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
import { IFRAME_ENCODED_STATE, IFRAME_GEOMETRY_REFERENCE_ID } from '../../../../utils/markup';
import { IFrameComponents } from '../../../../domain/iframeComponents';
import { QueryParameters } from '../../../../domain/queryParameters';

const Update_Category = 'update_category';
const Update_Description = 'update_description';
const Update_EMail = 'update_email';
const Update_CategoryOptions = 'update_categoryoptions';
const Update_Geometry_Id = 'update_geometry_id';
const Update_State = 'update_state';
const Remember_Submit = 'remember_submit';
const Update_Media_Related_Properties = 'update_isPortrait_hasMinWidth';

/**
 * Contains a map-iframe and a form for submitting a {@link module:services/FeedbackService~MapFeedback}.
 * @class
 */
export class MapFeedbackPanel extends MvuElement {
	constructor() {
		super({
			mapFeedback: {
				state: null,
				category: null,
				description: null,
				email: null,
				fileId: null
			},
			categoryOptions: [],
			submitWasClicked: false,
			isPortrait: false
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			FeedbackService: feedbackService,
			ShareService: shareService,
			FileStorageService: fileStorageService
		} = $injector.inject('ConfigService', 'TranslationService', 'FeedbackService', 'ShareService', 'FileStorageService');

		this._configService = configService;
		this._translationService = translationService;
		this._feedbackService = feedbackService;
		this._shareService = shareService;
		this._fileStorageService = fileStorageService;
		this._iframeObserver = null;
	}

	onInitialize() {
		this._getCategoryOptions();
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_Media_Related_Properties, { isPortrait: media.portrait })
		);
	}

	onAfterRender(firstTime) {
		const onIFrameChanged = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === 'attributes' && mutation.attributeName === IFRAME_GEOMETRY_REFERENCE_ID) {
					this._updateFileId(mutation.target.getAttribute(IFRAME_GEOMETRY_REFERENCE_ID));
					this._updateState(this._encodeFeedbackState(mutation.target.getAttribute(IFRAME_ENCODED_STATE)));
				}

				if (mutation.type === 'attributes' && mutation.attributeName === IFRAME_ENCODED_STATE) {
					this._updateState(this._encodeFeedbackState(mutation.target.getAttribute(IFRAME_ENCODED_STATE)));
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

	onDisconnect() {
		this._iframeObserver?.disconnect();
		this._iframeObserver = null;
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
			emitNotification(translate('feedback_mapFeedback_saved_successfully'), LevelTypes.INFO);
		} catch (e) {
			console.error(e);
			emitNotification(translate('feedback_mapFeedback_could_not_save'), LevelTypes.ERROR);
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
			case Update_State:
				return { ...model, mapFeedback: { ...model.mapFeedback, state: data } };
			case Remember_Submit:
				return { ...model, submitWasClicked: data };
			case Update_Media_Related_Properties:
				return { ...model, ...data };
		}
	}

	_updateFileId(id) {
		this.signal(Update_Geometry_Id, id);
	}

	_updateState(state) {
		this.signal(Update_State, state);
	}

	_encodeFeedbackState(iframeState) {
		const { mapFeedback } = this.getModel();
		const iframeParams = new URLSearchParams(iframeState.split('?')[1]);
		if (mapFeedback.fileId) {
			const layers = iframeParams.has(QueryParameters.LAYER) ? iframeParams.get(QueryParameters.LAYER).split(',') : [];
			if (!layers.includes(mapFeedback.fileId)) {
				iframeParams.set(QueryParameters.LAYER, [...layers, mapFeedback.fileId].join(','));
			}
		}
		return `${this._configService.getValueAsPath('FRONTEND_URL')}?${decodeURIComponent(iframeParams.toString())}`;
	}

	createView(model) {
		const { mapFeedback, categoryOptions, isPortrait } = model;

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

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const handleSubmit = () => {
			this.signal(Remember_Submit, true);

			const category = this.shadowRoot.getElementById('category');
			const description = this.shadowRoot.getElementById('description');
			const email = this.shadowRoot.getElementById('email');
			if (
				mapFeedback.state !== null &&
				mapFeedback.fileId !== null &&
				isValidCategory(category) &&
				isValidDescription(description) &&
				isValidEmail(email)
			) {
				this._saveMapFeedback(
					new MapFeedback(mapFeedback.state, mapFeedback.category, mapFeedback.description, mapFeedback.fileId, mapFeedback.email)
				);
			}
		};

		const getExtraParameters = () => {
			const queryParameters = {};
			queryParameters[QueryParameters.LAYER] = '914c9263-5312-453e-b3eb-5104db1bf788'; // TODO: replace with layer from FeedbackService
			queryParameters[QueryParameters.IFRAME_COMPONENTS] = [IFrameComponents.DRAW_TOOL];
			return queryParameters;
		};

		const filterUserGeneratedLayers = (encodedState) => {
			const [baseUrl, searchParamsString] = encodedState.split('?');
			const searchParams = new URLSearchParams(searchParamsString);
			const layers = searchParams.has(QueryParameters.LAYER) ? searchParams.get(QueryParameters.LAYER).split(',') : [];

			searchParams.set(
				QueryParameters.LAYER,
				layers.filter((l) => !this._fileStorageService.isAdminId(l) && !this._fileStorageService.isFileId(l)).join(',')
			);
			return `${baseUrl}?${decodeURIComponent(searchParams.toString())}`;
		};

		// Create an iframe source without any user-generated georesources that could be unintentionally affect the feedback or the georesource itself.
		const iframeSrc = filterUserGeneratedLayers(this._shareService.encodeState(getExtraParameters(), [PathParameters.EMBED]));
		return html`
			<style>
				${css}
			</style>
			<div class="map-feedback__container ${getOrientationClass()}">
				<div class="map-feedback__iframe">
					<iframe
						data-iframe-geometry-reference-id
						data-iframe-encoded-state
						src=${iframeSrc}
						width="900px"
						height="700px"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
					${mapFeedback.fileId
						? html.nothing
						: html`<span class="map-feedback__iframe-hint">${translate('feedback_mapFeedback_geometry_missing')}</span>`}
				</div>
				<div class="map-feedback__form">
					<span id="feedbackPanelTitle" class="ba-list-item__main-text">${translate('feedback_mapFeedback_header')}</span>
					<div class="map-feedback__form-hint">
						${translate('feedback_mapFeedback_text_before')}
						<span class="map-feedback__highlight">${translate('feedback_mapFeedback_text_map')}</span>
						${translate('feedback_mapFeedback_text_after')}
					</div>
					<div class="ba-form-element">
						<select id="category" .value="${mapFeedback.category}" @change="${handleCategoryChange}" required>
							${categoryOptions.map((option) => html` <option value="${option}">${option}</option> `)}
						</select>
						<label for="category" class="control-label">${translate('feedback_mapFeedback_categorySelection')}</label><i class="bar"></i>
						<label class="helper-label">${translate('feedback_mapFeedback_categorySelection_helper')}</label>
					</div>
					<div class="ba-form-element">
						<textarea
							id="description"
							.value="${mapFeedback.description}"
							@input="${handleDescriptionChange}"
							required
							placeholder="${translate('feedback_mapFeedback_changeDescription')}"
						></textarea>
						<label for="description" class="control-label">${translate('feedback_mapFeedback_changeDescription')}</label>
						<i class="bar"></i>
						<label class="helper-label">${translate('feedback_mapFeedback_changeDescription_helper')}</label>
						<label class="error-label">${translate('feedback_mapFeedback_changeDescription_error')}</label>
						<i class="icon error"></i>
					</div>
					<div class="ba-form-element">
						<input
							type="email"
							id="email"
							.value="${mapFeedback.email}"
							@input="${handleEmailChange}"
							placeholder="${translate('feedback_mapFeedback_eMail')}"
						/>
						<label for="email" class="control-label">${translate('feedback_mapFeedback_eMail')}</label>
						<i class="bar"></i>
						<i class="icon error"></i>
						<label class="helper-label">${translate('feedback_mapFeedback_eMail_helper')}</label>
						<label class="error-label">${translate('feedback_mapFeedback_eMail_error')}</label>
					</div>
					<p id="feedback_mapFeedback_disclaimer" class="map-feedback__disclaimer" id="mapFeedback_disclaimer">
						${translate('feedback_mapFeedback_disclaimer')} (<a href="${translate('global_privacy_policy_url')}" target="_blank"
							>${translate('feedback_mapFeedback_privacyPolicy')}</a
						>).
					</p>
					<ba-button id="button0" .label=${translate('feedback_mapFeedback_submit')} .type=${'primary'} @click=${handleSubmit} />
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-feedbackpanel';
	}
}
