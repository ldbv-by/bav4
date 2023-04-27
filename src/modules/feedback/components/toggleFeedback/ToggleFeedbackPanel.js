/**
 * @module modules/feedback/components/toggleFeedback/ToggleFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './toggleFeedbackPanel.css';
import { classMap } from 'lit-html/directives/class-map.js';

/**
 * possible feedback types
 * @enum
 */
export const FeedbackType = Object.freeze({
	MAP: 'map',
	GENERAL: 'general'
});

const Select_Feedback_Type = 'select_feedback_type';

export class ToggleFeedbackPanel extends MvuElement {
	constructor() {
		super({
			selectedFeedbackPanel: null
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');

		this._translationService = translationService;
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
				<h2 id="toggleFeedbackPanelTitle">${translate('feedback_toggleFeedback_header')}</h2>
				<ba-button
					id="feedbackGeneralButton"
					.label=${translate('feedback_toggleFeedback_generalButton')}
					.type=${'primary'}
					@click=${() => this.signal(Select_Feedback_Type, FeedbackType.GENERAL)}
				></ba-button>
				<ba-button
					id="feedbackMapButton"
					.label=${translate('feedback_toggleFeedback_mapButton')}
					.type=${'primary'}
					@click=${() => this.signal(Select_Feedback_Type, FeedbackType.MAP)}
				></ba-button>
			</div>
			<div class="toggleMap ${classMap(mapClasses)}">
				<ba-mvu-feedbackpanel></ba-mvu-feedbackpanel>
			</div>
			<div class="toggleGeneral ${classMap(generalClasses)}">general feedback todo</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-togglefeedbackpanel';
	}
}
