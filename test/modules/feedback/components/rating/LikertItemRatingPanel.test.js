import { $injector } from '../../../../../src/injection';
import { LikertItemRatingPanel, Rating } from '../../../../../src/modules/feedback/components/rating/LikertItemRatingPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(LikertItemRatingPanel.tag, LikertItemRatingPanel);

const setup = (state = {}) => {
	const initialState = {
		...state
	};

	TestUtils.setupStoreAndDi(initialState);

	$injector.registerSingleton('TranslationService', { translate: (key) => key });

	return TestUtils.renderAndLogLifecycle(LikertItemRatingPanel.tag);
};

describe('LikertItemRatingPanel', () => {
	describe('Rating', () => {
		it('provides an enum of possible response values', () => {
			expect(Object.keys(Rating).length).toBe(6);

			expect(Rating.NONE).toBe(0);
			expect(Rating.STRONGLY_DISAGREE).toBe(1);
			expect(Rating.DISAGREE).toBe(2);
			expect(Rating.NEUTRAL).toBe(3);
			expect(Rating.AGREE).toBe(4);
			expect(Rating.STRONGLY_AGREE).toBe(5);
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new LikertItemRatingPanel();

			expect(element.getModel()).toEqual({
				rating: Rating.NONE
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const prefix = 'likertItem_response_';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(3);

			const responseButtons = element.shadowRoot.querySelectorAll('.likert-response-button');
			expect(responseButtons.length).toBe(5);
			responseButtons.forEach((responseButton) => {
				expect(responseButton.classList.contains('unselected')).toBeTrue();
				expect(responseButton.classList.contains('selected')).toBeFalse();
				expect(responseButton.onClick).toEqual(element.onRatingClick);
				expect(responseButton.title).toMatch(new RegExp(`^${prefix}`));
			});
		});
	});

	describe('when rating is set (via property)', () => {
		it('updates the UI', async () => {
			// arrange
			const element = await setup();
			const ratingSpy = spyOnProperty(element, 'rating', 'set').and.callThrough();

			// act
			element.rating = Rating.DISAGREE;

			// assert
			expect(ratingSpy).toHaveBeenCalled();
			expect(element.rating).toBe(Rating.DISAGREE);

			const responseButtons = element.shadowRoot.querySelectorAll('.likert-response-button');
			responseButtons.forEach((responseButton) => {
				if (['likertItem_response_unlikely'].includes(responseButton.title)) {
					expect(responseButton.classList.contains('unselected')).toBeFalse();
					expect(responseButton.classList.contains('selected')).toBeTrue();
				} else {
					expect(responseButton.classList.contains('unselected')).toBeTrue();
					expect(responseButton.classList.contains('selected')).toBeFalse();
				}
			});
		});
	});

	describe('when any response button is pressed', () => {
		it('calls a registered "onChange" handler', async () => {
			// arrange
			const element = await setup();
			const onRatingClickSpy = spyOn(element, '_onRatingClick');

			// act
			const responseButtons = element.shadowRoot.querySelectorAll('.likert-response-button');
			responseButtons.forEach((responseButton) => {
				responseButton.click();
			});

			// assert
			expect(responseButtons.length).toBe(5);
			expect(onRatingClickSpy).toHaveBeenCalledTimes(5);
		});

		it('displays the button as selected', async () => {
			// arrange
			const element = await setup();

			const responseButtons = element.shadowRoot.querySelectorAll('.likert-response-button');
			responseButtons.forEach((responseButton) => {
				// act
				responseButton.click();

				// assert
				expect(responseButton.classList.contains('selected')).toBeTrue();
			});
		});

		it('fires a "change" event', async () => {
			// arrange
			const element = await setup();
			const spy = jasmine.createSpy();
			const starButton = element.shadowRoot.querySelectorAll('.likert-response-button')[0];
			element.addEventListener('change', spy);

			// act
			starButton.click();

			// assert
			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { rating: element.rating } }));
		});

		it('fires a "change" event', async () => {
			// arrange
			const element = await setup();
			const spy = jasmine.createSpy();
			element.addEventListener('change', spy);

			const responseButtons = element.shadowRoot.querySelectorAll('.likert-response-button');
			responseButtons.forEach((responseButton) => {
				// act
				responseButton.click();
				// assert
				expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { rating: element.rating } }));
			});
		});
	});
});
