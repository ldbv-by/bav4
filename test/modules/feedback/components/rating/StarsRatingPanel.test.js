import { $injector } from '../../../../../src/injection';
import { StarsRatingPanel, Rating } from '../../../../../src/modules/feedback/components/rating/StarsRatingPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(StarsRatingPanel.tag, StarsRatingPanel);

const setup = (state = {}) => {
	const initialState = {
		...state
	};

	TestUtils.setupStoreAndDi(initialState);

	$injector.registerSingleton('TranslationService', { translate: (key) => key });

	return TestUtils.renderAndLogLifecycle(StarsRatingPanel.tag);
};

describe('StarsRatingPanel', () => {
	describe('Rating', () => {
		it('provides an enum of possible ratings', () => {
			expect(Object.keys(Rating).length).toBe(6);

			expect(Rating.NONE).toBe(0);
			expect(Rating.TERRIBLE).toBe(1);
			expect(Rating.BAD).toBe(2);
			expect(Rating.SATISFIED).toBe(3);
			expect(Rating.GOOD).toBe(4);
			expect(Rating.EXCELLENT).toBe(5);
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new StarsRatingPanel();

			expect(element.getModel()).toEqual({
				rating: Rating.NONE
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const prefix = 'fiveButtonRating_';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(3);

			const starButtons = element.shadowRoot.querySelectorAll('.star-button');
			expect(starButtons.length).toBe(5);
			starButtons.forEach((starButton) => {
				expect(starButton.onClick).toEqual(element.onRatingClick);
				expect(starButton.title).toMatch(new RegExp(`^${prefix}`));
			});
		});

		it('setter and getter work', async () => {
			// arrange
			const element = await setup();
			const ratingSpy = spyOnProperty(element, 'rating', 'set').and.callThrough();
			const prefix = 'fiveButtonRating_';

			// act
			element.rating = Rating.BAD;

			// assert
			expect(ratingSpy).toHaveBeenCalled();
			expect(element.rating).toBe(Rating.BAD);

			const starButtons = element.shadowRoot.querySelectorAll('.star-button');
			expect(starButtons.length).toBe(5);
			starButtons.forEach((starButton) => {
				expect(starButton.onClick).toEqual(element.onRatingClick);
				expect(starButton.title).toMatch(new RegExp(`^${prefix}`));
			});
		});

		it('button  click calls _onRatingClick', async () => {
			// arrange
			const element = await setup();
			const ratingSpy = spyOn(element, '_onRatingClick').and.callThrough();

			// act
			const starButtons = element.shadowRoot.querySelectorAll('.star-button');
			starButtons.forEach((starButton) => {
				starButton.click();
			});

			// assert
			expect(ratingSpy).toHaveBeenCalledTimes(5);
		});
	});

	describe('when any rating button is pressed', () => {
		it('calls _onRatingClick', async () => {
			// arrange
			const element = await setup();
			const onRatingClickSpy = spyOn(element, '_onRatingClick');

			// act
			const starButtons = element.shadowRoot.querySelectorAll('.star-button');
			expect(starButtons.length).toBe(5);
			starButtons.forEach((starButton) => {
				starButton.click();
			});

			// assert
			expect(onRatingClickSpy).toHaveBeenCalled();
			expect(onRatingClickSpy).toHaveBeenCalledTimes(5);
		});
	});
});
