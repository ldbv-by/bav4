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
	TERRIBLE: 1,
	BAD: 2,
	SATISFIED: 3,
	GOOD: 4,
	EXCELLENT: 5
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

			<div>
				<button
					class="star-button ${Rating.TERRIBLE <= rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.TERRIBLE)}"
					title="${translate('fiveButtonRating_terrible')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.BAD <= rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.BAD)}"
					title="${translate('fiveButtonRating_bad')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.SATISFIED <= rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.SATISFIED)}"
					title="${translate('fiveButtonRating_satisfied')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.GOOD <= rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.GOOD)}"
					title="${translate('fiveButtonRating_good')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.EXCELLENT <= rating ? 'selected' : 'unselected'}"
					@click="${() => this._onRatingClick(Rating.EXCELLENT)}"
					title="${translate('fiveButtonRating_excellent')}"
				>
					*
				</button>
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
