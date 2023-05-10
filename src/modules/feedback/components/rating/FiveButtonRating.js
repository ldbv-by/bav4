/* eslint-disable no-console */
// todo remove
/**
 * @module modules/feedback/components/FiveButtonRating
 */
import { html } from 'lit-html';
import css from './fiveButtonRating.css';
import { MvuElement } from '../../../MvuElement';
import { $injector } from '../../../../injection';

/**
 * possible rating types
 * @enum
 */
export const Rating = Object.freeze({
	NONE: '0',
	TERRIBLE: '1',
	BAD: '2',
	SATISFIED: '3',
	GOOD: '4',
	EXCELLENT: '5'
});

const Update_Rating = 'update_rating';

export class FiveButtonRating extends MvuElement {
	constructor() {
		super({
			rating: Rating.NONE
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;

		this.required = true;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Rating:
				return { ...model, rating: data };
		}
	}

	createView(model) {
		const { rating } = model;

		const translate = (key) => this._translationService.translate(key);

		const handleRatingChange = (rating) => {
			if (rating === Rating.EXCELLENT) {
				rating = Rating.NONE;
			}
			this.signal(Update_Rating, rating);

			this.dispatchEvent(
				new CustomEvent('rating', {
					detail: { rating }
				})
			);
			this.dispatchEvent(
				new CustomEvent('input', {
					detail: { rating }
				})
			);
			this.dispatchEvent(
				new CustomEvent('change', {
					detail: { rating }
				})
			);
		};

		return html`
			<style>
				${css}
			</style>

			<div>
				<button
					class="star-button ${Rating.TERRIBLE <= rating ? 'selected' : 'unselected'}"
					@click="${() => handleRatingChange(Rating.TERRIBLE)}"
					title="${translate('fiveButtonRating_terrible')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.BAD <= rating ? 'selected' : 'unselected'}"
					@click="${() => handleRatingChange(Rating.BAD)}"
					title="${translate('fiveButtonRating_bad')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.SATISFIED <= rating ? 'selected' : 'unselected'}"
					@click="${() => handleRatingChange(Rating.SATISFIED)}"
					title="${translate('fiveButtonRating_satisfied')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.GOOD <= rating ? 'selected' : 'unselected'}"
					@click="${() => handleRatingChange(Rating.GOOD)}"
					title="${translate('fiveButtonRating_good')}"
				>
					*
				</button>
				<button
					class="star-button ${Rating.EXCELLENT <= rating ? 'selected' : 'unselected'}"
					@click="${() => handleRatingChange(Rating.EXCELLENT)}"
					title="${translate('fiveButtonRating_excellent')}"
				>
					*
				</button>
			</div>
		`;
	}

	/**
	 * supply reportValidity for browser validity check
	 */
	//
	// reportValidity() {
	// 	const { rating } = this.getModel();
	// 	return rating > Rating.NONE;
	// }
	reportValidity() {
		console.log('🚀 ~ FiveButtonRating ~ reportValidity');

		const { rating } = this.getModel();

		console.log('🚀 ~ FiveButtonRating ~ reportValidity ~ rating:', rating);
		console.log('🚀 ~ FiveButtonRating ~ reportValidity ~ this.required:', this.required);
		if (this.required && rating === Rating.NONE) {
			console.log('🚀 ~ FiveButtonRating ~ reportValidity ~ return false;');
			return false;
		} else {
			console.log('🚀 ~ FiveButtonRating ~ reportValidity ~ return true;');
			return true;
		}
	}

	/**
	 * supply checkValidity for browser validity check
	 */
	checkValidity() {
		console.log('🚀 ~ FiveButtonRating ~ checkValidity');
		return this.reportValidity();
	}

	static get tag() {
		return 'ba-mvu-fivebuttonrating';
	}
}
