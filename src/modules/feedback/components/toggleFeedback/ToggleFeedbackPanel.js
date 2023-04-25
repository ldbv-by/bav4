/**
 * @module modules/feedback/components/toggleFeedback/ToggleFeedbackPanel
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from '../toggleFeedbackPanel.css';

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
		// const translate = (key) => this._translationService.translate(key);
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

		const selectedFeedbackTypeMap = () => {
			this.signal(Select_Feedback_Type, FeedbackType.MAP);
		};

		const selectFeedbackTypeGeneral = () => {
			this.signal(Select_Feedback_Type, FeedbackType.GENERAL);
		};

		return html`
			<style>
				${css}
			</style>

			<div style="display: ${displayButtons};margin-bottom: 10px;">
				<ba-button id="selectFeedbackMapButton" .label=${'Map Feedback'} .type=${'primary'} @click=${selectedFeedbackTypeMap} />
			</div>
			<div style="display: ${displayButtons};">
				<ba-button id="selectFeedbackGeneralButton" .label=${'General Feedback'} .type=${'primary'} @click=${selectFeedbackTypeGeneral} />
			</div>
			<div style="display: ${displayGeneral};">
				<ba-mvu-generalfeedbackpanel></ba-mvu-generalfeedbackpanel>
			</div>
			<div class="example row" style="display: ${displayMap};">
				<ba-mvu-mapfeedbackpanel></ba-mvu-mapfeedbackpanel>
			</div>
		`;
	}

	static get tag() {
		return 'ba-mvu-togglefeedbackpanel';
	}
}
