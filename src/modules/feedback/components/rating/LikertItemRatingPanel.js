/**
 * @module modules/feedback/components/rating/LikertItemRatingPanel
 */

import { html } from 'lit-html';
import css from './likertItemRatingPanel.css';
import { MvuElement } from '../../../MvuElement';
import { $injector } from '../../../../injection';

/**
 * Rating scale values for a Likert-Item, a type of a rating scale (@see {@link https://en.wikipedia.org/wiki/Likert_scale|Likert-Scale})
 * @readonly
 * @enum {number}
 */
export const Rating = Object.freeze({
	NONE: 0,
	STRONGLY_DISAGREE: 1,
	DISAGREE: 2,
	NEUTRAL: 3,
	AGREE: 4,
	STRONGLY_AGREE: 5
});

const Update_Rating = 'update_rating';

/**
 * Rating component, to display '...a statement that the respondent is asked to evaluate by giving
 * it a quantitative value on any kind of subjective or objective dimension, with level of
 * agreement/disagreement being the dimension most commonly used.'
 * ({@link https://en.wikipedia.org/wiki/Likert_scale|Source})
 *
 * The component consists of 5 buttons, related to a concrete response value of the rating scale to the asked subject.
 * @see {@link https://en.wikipedia.org/wiki/Likert_scale|Likert-Scale}
 * @fires  change when the rating has changed
 * @property {Rating} rating - The selected rating.
 * @class
 * @author norbertK
 * @author thiloSchlemmer
 */
export class LikertItemRatingPanel extends MvuElement {
	constructor() {
		super({
			rating: Rating.NONE
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Rating:
				return { ...model, rating: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observeModel('rating', (rating) => {
			this.dispatchEvent(
				new CustomEvent('change', {
					detail: { rating }
				})
			);
		});
	}

	createView(model) {
		const { rating } = model;
		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>
				${css}
			</style>

			<div class="container">
				<button
					class="likert-response-button ${'rating-' + Rating.STRONGLY_DISAGREE} ${Rating.STRONGLY_DISAGREE === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.STRONGLY_DISAGREE)}"
					title="${translate('likertItem_response_very_unlikely')}"
				></button>
				<button
					class="likert-response-button ${'rating-' + Rating.DISAGREE} ${Rating.DISAGREE === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.DISAGREE)}"
					title="${translate('likertItem_response_unlikely')}"
				></button>
				<button
					class="likert-response-button ${'rating-' + Rating.NEUTRAL} ${Rating.NEUTRAL === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.NEUTRAL)}"
					title="${translate('likertItem_response_neutral')}"
				></button>
				<button
					class="likert-response-button ${'rating-' + Rating.AGREE} ${Rating.AGREE === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.AGREE)}"
					title="${translate('likertItem_response_likely')}"
				></button>
				<button
					class="likert-response-button ${'rating-' + Rating.STRONGLY_AGREE} ${Rating.STRONGLY_AGREE === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.STRONGLY_AGREE)}"
					title="${translate('likertItem_response_very_likely')}"
				></button>
			</div>
		`;
	}

	_onRatingClick(rating) {
		this.rating = rating;
	}

	set rating(value) {
		this.signal(Update_Rating, value);
	}

	get rating() {
		return this.getModel().rating;
	}

	static get tag() {
		return 'ba-likert-item-rating-panel';
	}
}
