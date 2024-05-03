// import { html } from 'lit-html';
import { html } from '../../../../../node_modules/lit-html/lit-html';
// import { $injector } from '../../../../injection';
import { $injector } from '../../../../injection/index';
import { closeModal } from '../../../../store/modal/modal.action';
import { MvuElement } from '../../../MvuElement';
// import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
// @ts-ignore
import css from './NewTopicPanel.css';
// import { GeneralFeedback } from '../../../../services/FeedbackService';

const Update_Id = 'update_id';
const Update_Label = 'update_label';

/**
 * Contains a form for submitting a new topic.
 * @property {Function} onSubmit
 * @class
 */
export class NewTopicPanel extends MvuElement {
	constructor() {
		console.log('🚀 ~ NewTopicPanel ~ constructor ');
		super({
			newTopic: {
				id: null,
				label: null
			}
		});

		const {
			ConfigService: configService,
			// TranslationService: translationService,
			// FeedbackService: feedbackService,
			SecurityService: securityService
		} = $injector.inject('ConfigService', 'SecurityService'); // , 'TranslationService', 'FeedbackService'

		this._configService = configService;
		// this._translationService = translationService;
		// this._feedbackService = feedbackService;
		this._securityService = securityService;
		this._onSubmit = () => {};
		// @ts-ignore
		// eslint-disable-next-line no-unused-vars
		this._returnNewTopic = (something) => {};
	}

	onInitialize() {
		console.log('🚀 ~ NewTopicPanel ~ onInitialize() ');
	}

	update(type, data, model) {
		switch (type) {
			case Update_Id:
				return { ...model, newTopic: { ...model.newTopic, id: data } };
			case Update_Label:
				return { ...model, newTopic: { ...model.newTopic, label: data } };
		}
	}

	createView(model) {
		const { newTopic } = model;
		console.log('🚀 ~ NewTopicPanel ~ createView ~ model:', model);

		this._returnNewTopic(newTopic);

		// const translate = (key) => this._translationService.translate(key);

		const onIdChange = (event) => {
			const { value } = event.target;

			this.signal(Update_Id, this._securityService.sanitizeHtml(value));
		};

		const onLabelChange = (event) => {
			const { value } = event.target;

			this.signal(Update_Label, this._securityService.sanitizeHtml(value));
		};

		const onSubmit = () => {
			// 	this.shadowRoot.querySelectorAll('.ba-form-element').forEach((el) => el.classList.add(BA_FORM_ELEMENT_VISITED_CLASS));
			// 	const newTopicIdElement = this.shadowRoot.getElementById('newTopicId');
			// 	const newTopicLabelElement = this.shadowRoot.getElementById('newTopicLabel');
			// 	if (newTopicIdElement.reportValidity() && descriptionElement.reportValidity() && emailElement.reportValidity()) {
			// 		this
			// 			._saveNewTopic
			// 			// new GeneralFeedback(generalFeedback.category, generalFeedback.description, generalFeedback.email, generalFeedback.rating)
			// 			();
			// 	}
			this._returnNewTopic(newTopic);
			closeModal();
		};

		const label = 'Save';

		return html`
			<style>
				${css}
			</style>

			<div id="feedbackPanelTitle" class="feedback-main-header">New Topic</div>

			<div class="ba-form-element">
				<textarea
					type="text"
					id="newTopicLabel"
					placeholder="new topic label"
					.value="${newTopic.label}"
					@input="${onLabelChange}"
					required
				></textarea>
				<label for="newTopicLabel" class="control-label">Text</label>
				<i class="bar"></i>
				<i class="icon error"></i>
			</div>

			<div class="ba-form-element">
				<textarea type="text" id="newTopicId" placeholder="new topic id" .value="${newTopic.id}" @input="${onIdChange}" required></textarea>
				<label for="newTopicId" class="control-label">Beschreibung</label>
				<i class="bar"></i>
				<i class="icon error"></i>
			</div>

			<ba-button id="button0" .label=${label} .type=${'primary'} @click=${onSubmit}></ba-button>
		`;
	}
	// <ba-button id="button0" .label=${'Create New Topic'} .type=${'primary'} @click=${this._onSubmit(newTopic)}></ba-button>

	async _saveNewTopic() {
		// const translate = (key) => this._translationService.translate(key);
		// try {
		// 	await this._feedbackService.save(generalFeedback);
		// 	this._onSubmit();
		// 	emitNotification(translate('feedback_saved_successfully'), LevelTypes.INFO);
		// } catch (e) {
		// 	console.error(e);
		// 	emitNotification(translate('feedback_generalFeedback_could_not_save'), LevelTypes.ERROR);
		// }
	}

	/**
	 * Registers a callback function which will be called when the form was submitted successfully.
	 * @type {Function}
	 */
	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	/**
	 * Sets the returnNewTopic callback.
	 *
	 * @param {function} callback - The callback function to be set.
	 */
	set returnNewTopic(callback) {
		this._returnNewTopic = callback;
	}

	static get tag() {
		return 'ba-mvu-newtopicpanel';
	}
}
