/**
 * @module modules/admin/components/newTopic/NewTopicPanel
 */
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

const Update_Topic = 'update_topic';
// const Update_Id = 'update_id';
const Update_Label = 'update_label';
const Update_Description = 'update_description';

/**
 * Contains a form for submitting a new topic.
 * @property {Function} onSubmit
 * @class
 */
export class NewTopicPanel extends MvuElement {
	constructor() {
		super({
			topic: null
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
		// eslint-disable-next-line no-unused-vars
		this._updateTopic = (topic) => {};
	}

	update(type, data, model) {
		const newTopic = model.topic.clone();
		const newTopicFromData = data.clone();
		switch (type) {
			case Update_Topic:
				return { ...model, topic: newTopicFromData };
			case Update_Label:
				newTopic.label = data;
				return { ...model, topic: newTopic };
			case Update_Description:
				newTopic.description = data;
				return { ...model, topic: newTopic };
		}
	}

	createView(model) {
		const { topic } = model;

		const onDescriptionChange = (event) => {
			const { value } = event.target;

			this.signal(Update_Description, this._securityService.sanitizeHtml(value));
		};

		const onLabelChange = (event) => {
			const { value } = event.target;
			const sanitized = this._securityService.sanitizeHtml(value);
			this.signal(Update_Label, sanitized);
		};

		const onSubmit = () => {
			this._updateTopic(topic);
			closeModal();
		};

		const label = 'Save';

		return html`
			<style>
				${css}
			</style>

			<div class="ba-form-element">
				<textarea type="text" id="newTopicLabel" placeholder="new topic label" .value="${topic.label}" @input="${onLabelChange}" required></textarea>
				<label for="newTopicLabel" class="control-label">Text</label>
				<i class="bar"></i>
				<i class="icon error"></i>
			</div>

			<div class="ba-form-element">
				<textarea
					type="text"
					id="newTopicId"
					placeholder="new topic id"
					.value="${topic.description}"
					@input="${onDescriptionChange}"
					required
				></textarea>
				<label for="newTopicId" class="control-label">Beschreibung</label>
				<i class="bar"></i>
				<i class="icon error"></i>
			</div>

			<ba-button id="button0" .label=${label} .type=${'primary'} @click=${onSubmit}></ba-button>
		`;
	}

	/**
	 * Sets the topic.
	 * @param {string} value - The topic to
	 * be edited.
	 */
	set topic(value) {
		this.signal(Update_Topic, value);
	}

	get topic() {
		return this.getModel().topic;
	}

	/**
	 * Sets the updateTopic callback.
	 *
	 * @param {function} callback - The callback function to be set.
	 */
	set updateTopic(callback) {
		// @ts-ignore
		this._updateTopic = callback;
	}

	static get tag() {
		return 'ba-mvu-newtopicpanel';
	}
}
