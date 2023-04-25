/**
 * @module modules/feedback/components/toggleFeedback/ToggleFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './toggleFeedbackPanel.css';

/**
 * possible feedback types
 * @enum
 */
export const FeedbackType = Object.freeze({
	NONE: 'none',
	MAP: 'map',
	GENERAL: 'general'
});

const Select_Feedback_Type = 'select_feedback_type';

export class ToggleFeedbackPanel extends MvuElement {
	constructor() {
		super({
			selectedFeedbackPanel: FeedbackType.NONE
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
		let displayButtons, displayMap, displayGeneral;

		switch (selectedFeedbackPanel) {
			case FeedbackType.MAP:
				displayButtons = 'none';
				displayMap = 'block';
				displayGeneral = 'none';
				break;

			case FeedbackType.GENERAL:
				displayButtons = 'none';
				displayMap = 'none';
				displayGeneral = 'block';
				break;

			default:
				displayButtons = 'block';
				displayMap = 'none';
				displayGeneral = 'none';
				break;
		}

		const feedbackTypeMap = () => {
			this.signal(Select_Feedback_Type, FeedbackType.MAP);
		};

		const feedbackTypeGeneral = () => {
			this.signal(Select_Feedback_Type, FeedbackType.GENERAL);
		};

		return html`
			<style>
				${css}
			</style>

			<h2 id="toggleFeedbackPanelTitle" style="display: ${displayButtons};">${translate('feedback_toggleFeedback_header')}</h2>

			<div id="feedbackMapButtonContainer" style="display: ${displayButtons};margin-bottom: 10px;">
				<ba-button id="feedbackMapButton" .label=${translate('feedback_toggleFeedback_mapButton')} .type=${'primary'} @click=${feedbackTypeMap} />
			</div>
			<div id="feedbackGeneralButtonContainer" style="display: ${displayButtons};">
				<ba-button
					id="feedbackGeneralButton"
					.label=${translate('feedback_toggleFeedback_generalButton')}
					.type=${'primary'}
					@click=${feedbackTypeGeneral}
				/>
			</div>
			<div id="generalFeedback" style="display: ${displayGeneral};">
				<ba-mvu-generalfeedbackpanel></ba-mvu-generalfeedbackpanel>
			</div>
			<div id="mapFeedback" style="display: ${displayMap};">
				<ba-mvu-feedbackpanel></ba-mvu-feedbackpanel>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-togglefeedbackpanel';
	}
}
