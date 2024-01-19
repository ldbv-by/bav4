/**
 * @module modules/feedback/components/toggleFeedback/ToggleFeedbackPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './toggleFeedbackPanel.css';
import { incrementStep } from '../../../../store/modal/modal.action';

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
const Center_Coordinate = 'center_coordinate';

/**
 * Allows the user to either select a map-related or a general feedback.
 * @property {Function} onSubmit Initially registers a callback function which will be called when one of the forms was submitted successfully
 * @property {module:domain/coordinateTypeDef~Coordinate|null} center Sets a coordinate and passes it to the MapFeedbackPanel by updating the view
 * @property {FeedbackType|null} type Sets the selected feedback type and updates the view
 * @class
 */
export class ToggleFeedbackPanel extends MvuElement {
	constructor() {
		super({
			selectedFeedbackPanel: null,
			center: null
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');

		this._translationService = translationService;
		this._onSubmit = () => {};
	}

	onInitialize() {
		this.observe(
			(state) => state.modal.currentStep,
			(currentStep) => {
				if (currentStep === 0) {
					this.signal(Select_Feedback_Type, null);
				}
			},
			false
		);
	}

	update(type, data, model) {
		switch (type) {
			case Select_Feedback_Type:
				return { ...model, selectedFeedbackPanel: data };
			case Center_Coordinate:
				return { ...model, center: data };
		}
	}

	createView(model) {
		const { selectedFeedbackPanel, center } = model;
		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>
				${css}
			</style>
			${selectedFeedbackPanel === null
				? html`
						<div class="toggleButtons">
							<button
								id="feedbackGeneralButton"
								class="ba-list-item"
								@click=${() => {
									incrementStep();
									this.signal(Select_Feedback_Type, FeedbackType.GENERAL);
								}}
							>
								<span class="ba-list-item__pre ">
									<span class="ba-list-item__icon chatleftdots"> </span>
								</span>
								<span class="ba-list-item__text ">
									<span class="ba-list-item__primary-text">${translate('feedback_generalFeedback')}</span>
									<span class="ba-list-item__secondary-text">${translate('feedback_toggleFeedback_generalButton_sub')}</span>
								</span>
							</button>
							<button
								id="feedbackMapButton"
								class="ba-list-item"
								@click=${() => {
									incrementStep();
									this.signal(Select_Feedback_Type, FeedbackType.MAP);
								}}
							>
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
						<div>
							<ba-mvu-mapfeedbackpanel .onSubmit=${this._onSubmit} .center=${center}></ba-mvu-mapfeedbackpanel>
						</div>
					`
				: nothing}
			${selectedFeedbackPanel === FeedbackType.GENERAL
				? html`
						<div class="toggleGeneral">
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

	set center(coordinate) {
		this.signal(Center_Coordinate, coordinate);
	}

	static get tag() {
		return 'ba-mvu-togglefeedbackpanel';
	}
}
