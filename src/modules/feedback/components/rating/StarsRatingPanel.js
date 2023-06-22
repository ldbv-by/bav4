/**
 * @module modules/feedback/components/rating/StarsRatingPanel
 */

import { html } from 'lit-html';
import css from './starsRatingPanel.css';
import { MvuElement } from '../../../MvuElement';
import { $injector } from '../../../../injection';

/**
 * possible rating types
 * @readonly
 * @enum {number}
 */
export const Rating = Object.freeze({
	NONE: 0,
	VERY_UNLIKELY: 1,
	UNLIKELY: 2,
	NEUTRAL: 3,
	LIKELY: 4,
	VERY_LIKELY: 5
});

const Update_Rating = 'update_rating';

/**
 * Rating component
 * @fires  change when the rating has changed
 * @property {Rating} rating - The selected rating.
 * @class
 * @author norbertK
 */
export class StarsRatingPanel extends MvuElement {
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
					class="star-button ${'rating-' + Rating.VERY_UNLIKELY} ${Rating.VERY_UNLIKELY === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.VERY_UNLIKELY)}"
					title="${translate('fiveButtonRating_very_unlikely')}"
				></button>
				<button
					class="star-button ${'rating-' + Rating.UNLIKELY} ${Rating.UNLIKELY === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.UNLIKELY)}"
					title="${translate('fiveButtonRating_unlikely')}"
				></button>
				<button
					class="star-button ${'rating-' + Rating.NEUTRAL} ${Rating.NEUTRAL === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.NEUTRAL)}"
					title="${translate('fiveButtonRating_neutral')}"
				></button>
				<button
					class="star-button ${'rating-' + Rating.LIKELY} ${Rating.LIKELY === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.LIKELY)}"
					title="${translate('fiveButtonRating_likely')}"
				></button>
				<button
					class="star-button ${'rating-' + Rating.VERY_LIKELY} ${Rating.VERY_LIKELY === rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.VERY_LIKELY)}"
					title="${translate('fiveButtonRating_very_likely')}"
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
		return 'ba-stars-rating-panel';
	}
}
