/**
 * @module modules/feedback/components/toggleFeedback/ToggleFeedbackPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './toggleFeedbackPanel.css';

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
 * @property {Function} onSubmit Registers a callback function which will be called when one of the forms was submitted successfully.
 * @property {FeedbackType|null} type Sets the selected feedback type.
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

		return html`
			<style>
				${css}
			</style>
			${selectedFeedbackPanel === null
				? html`
						<div class="toggleButtons active">
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
				  `
				: nothing}
			${selectedFeedbackPanel === FeedbackType.MAP
				? html`
						<div class="toggleMap active">
							<ba-mvu-mapfeedbackpanel .onSubmit=${this._onSubmit}></ba-mvu-mapfeedbackpanel>
						</div>
				  `
				: nothing}
			${selectedFeedbackPanel === FeedbackType.GENERAL
				? html`
						<div class="toggleGeneral active">
							<ba-mvu-generalfeedbackpanel .onSubmit=${this._onSubmit}></ba-mvu-generalfeedbackpanel>
						</div>
				  `
				: nothing}
		`;
	}

	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	set type(feedbackType) {
		this.signal(Select_Feedback_Type, feedbackType);
	}

	static get tag() {
		return 'ba-mvu-togglefeedbackpanel';
	}
}
