/**
 * @module modules/feedback/components/toggleFeedback/ToggleFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './toggleFeedbackPanel.css';
import { classMap } from 'lit-html/directives/class-map.js';

/**
 * Possible feedback types
 * @readonly
 * @enum {String}
 */
export const FeedbackType = Object.freeze({
	MAP: 'map',
	GENERAL: 'general'
});

const Select_Feedback_Type = 'select_feedback_type';

/**
 * Allows the user to either select a map-related or a general feedback.
 * @property {Function} onSubmit callback function
 * @property {FeedbackType} type
 * @class
 */
export class ToggleFeedbackPanel extends MvuElement {
	constructor() {
		super({
			selectedFeedbackPanel: null
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');

		this._translationService = translationService;
		this._onSubmit = () => {};
	}

	update(type, data, model) {
		switch (type) {
			case Select_Feedback_Type:
				return { ...model, selectedFeedbackPanel: data };
		}
	}

	createView(model) {
		const { selectedFeedbackPanel } = model;
		const translate = (key) => this._translationService.translate(key);

		const buttonClasses = {
			active: !selectedFeedbackPanel
		};
		const mapClasses = {
			active: selectedFeedbackPanel === FeedbackType.MAP
		};
		const generalClasses = {
			active: selectedFeedbackPanel === FeedbackType.GENERAL
		};

		return html`
			<style>
				${css}
			</style>

			<div class="toggleButtons ${classMap(buttonClasses)}">
				<button id="feedbackGeneralButton" class="ba-list-item" @click=${() => this.signal(Select_Feedback_Type, FeedbackType.GENERAL)}>
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__icon chatleftdots"> </span>
					</span>
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('feedback_generalFeedback')}</span>
						<span class="ba-list-item__secondary-text">${translate('feedback_toggleFeedback_generalButton_sub')}</span>
					</span>
				</button>
				<button id="feedbackMapButton" class="ba-list-item" @click=${() => this.signal(Select_Feedback_Type, FeedbackType.MAP)}>
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__icon map"> </span>
					</span>
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('feedback_mapFeedback')}</span>
						<span class="ba-list-item__secondary-text">${translate('feedback_toggleFeedback_mapButton_sub')}</span>
					</span>
				</button>
			</div>
			<div class="toggleMap ${classMap(mapClasses)}">
				<ba-mvu-mapfeedbackpanel .onSubmit=${this._onSubmit}></ba-mvu-mapfeedbackpanel>
			</div>
			<div class="toggleGeneral ${classMap(generalClasses)}">
				<ba-mvu-generalfeedbackpanel .onSubmit=${this._onSubmit}></ba-mvu-generalfeedbackpanel>
			</div>
		`;
	}

	/**
	 * Registers a callback function which will be called when one of the forms was submitted successfully.
	 * @type {Function}
	 */
	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	/**
	 * Sets the selected feedback type.
	 * @type {FeedbackType}
	 */
	set type(feedbackType) {
		this.signal(Select_Feedback_Type, feedbackType);
	}

	static get tag() {
		return 'ba-mvu-togglefeedbackpanel';
	}
}
