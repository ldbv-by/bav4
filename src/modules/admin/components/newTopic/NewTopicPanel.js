/**
 * @module modules/admin/components/newTopic/NewTopicPanel
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { $injector } from '../../../../injection/index';
import { closeModal } from '../../../../store/modal/modal.action';
import { MvuElement } from '../../../MvuElement';
// @ts-ignore
import css from './NewTopicPanel.css';

const Update_Topic = 'update_topic';
const Update_Label = 'update_label';
const Update_Description = 'update_description';

/**
 * Contains a form for editing a topic.
 * @property {Function} onSubmit
 * @class
 */
export class NewTopicPanel extends MvuElement {
	constructor() {
		super({
			topic: null
		});

		const { ConfigService: configService, SecurityService: securityService } = $injector.inject('ConfigService', 'SecurityService');

		this._configService = configService;
		this._securityService = securityService;
		// eslint-disable-next-line no-unused-vars
		this._updateTopic = (topic) => {};
	}

	update(type, data, model) {
		switch (type) {
			case Update_Topic:
				return { ...model, topic: data };
			case Update_Label:
				return { ...model, topic: data };
			case Update_Description:
				return { ...model, topic: data };
		}
	}

	createView(model) {
		const { topic } = model;

		const onDescriptionChange = (event) => {
			const { value } = event.target;

			const sanitizedDescription = this._securityService.sanitizeHtml(value);
			const newTopic = model.topic.clone();
			newTopic.description = sanitizedDescription;
			this.signal(Update_Description, newTopic);
		};

		const onLabelChange = (event) => {
			const { value } = event.target;
			const sanitizedLabel = this._securityService.sanitizeHtml(value);
			const newTopic = model.topic.clone();
			newTopic.label = sanitizedLabel;
			this.signal(Update_Label, newTopic);
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
