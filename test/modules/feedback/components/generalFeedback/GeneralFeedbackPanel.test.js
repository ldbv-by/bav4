import { $injector } from '../../../../../src/injection';
import { GeneralFeedbackPanel } from '../../../../../src/modules/feedback/components/generalFeedback/GeneralFeedbackPanel';
import { Rating } from '../../../../../src/modules/feedback/components/rating/StarsRatingPanel';
import { GeneralFeedback } from '../../../../../src/services/FeedbackService';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../../src/utils/markup';
import { TestUtils } from '../../../../test-utils';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';

window.customElements.define(GeneralFeedbackPanel.tag, GeneralFeedbackPanel);

const configServiceMock = {
	getValueAsPath: () => {}
};

const feedbackServiceMock = {
	save: () => {}
};

const securityServiceMock = {
	sanitizeHtml: () => {}
};

let store;

const setup = (state = {}) => {
	const initialState = {
		media: {
			portrait: true
		},
		...state
	};

	store = TestUtils.setupStoreAndDi(initialState, {
		media: createNoInitialStateMediaReducer(),
		notifications: notificationReducer
	});

	$injector
		.registerSingleton('TranslationService', { translate: (key) => key })
		.registerSingleton('ConfigService', configServiceMock)
		.registerSingleton('FeedbackService', feedbackServiceMock)
		.registerSingleton('SecurityService', securityServiceMock);

	return TestUtils.renderAndLogLifecycle(GeneralFeedbackPanel.tag);
};

describe('GeneralFeedbackPanel', () => {
	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new GeneralFeedbackPanel();

			expect(element.getModel()).toEqual({
				generalFeedback: {
					description: null,
					email: null,
					rating: null
				}
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_generalFeedback';
			const expectedDescription = '';
			const expectedEmail = '';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(8);
			expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);
			expect(element.shadowRoot.querySelector('#description').textContent).toBe(expectedDescription);
			expect(element.shadowRoot.querySelector('#email').textContent).toBe(expectedEmail);
			expect(element.shadowRoot.querySelector('#rating').rating).toBe(undefined);
		});

		it('renders form elements containing correct attributes', async () => {
			// arrange
			const element = await setup();

			const descriptionElement = element.shadowRoot.querySelector('#description');
			const emailElement = element.shadowRoot.querySelector('#email');

			// assert

			expect(descriptionElement.type).toBe('textarea');
			expect(descriptionElement.hasAttribute('required')).toBeTrue;
			expect(descriptionElement.hasAttribute('placeholder')).toBeTrue;
			expect(descriptionElement.parentElement.querySelector('label').innerText).toBe('feedback_changeDescription');

			expect(emailElement.type).toBe('email');
			expect(emailElement.hasAttribute('placeholder')).toBeTrue;
			expect(emailElement.parentElement.querySelector('label').innerText).toBe('feedback_eMail');
			expect(descriptionElement.hasAttribute('placeholder')).toBeFalse;
		});

		it('contains 3 unvisited ba-form-elements', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.ba-form-element')).toHaveSize(3);
			element.shadowRoot.querySelectorAll('.ba-form-element').forEach((el) => {
				expect(el.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS)).toBeFalse();
			});
		});

		it('renders a privacy policy disclaimer', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer').innerText).toContain('feedback_mapFeedback_disclaimer');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').href).toContain('global_privacy_policy_url');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').innerText).toBe('feedback_mapFeedback_privacyPolicy');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').target).toBe('_blank');
		});
	});

	describe('when submit is pressed', () => {
		it('does not call _saveGeneralFeedback if required fields are not filled', async () => {
			// arrange
			const element = await setup();
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback');

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveGeneralFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call _saveGeneralFeedback if description is not set', async () => {
			// arrange
			const element = await setup();
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback');

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveGeneralFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call _saveGeneralFeedback if email is set and not valid', async () => {
			// arrange
			const element = await setup();
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback');

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'no email';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveGeneralFeedbackSpy).not.toHaveBeenCalled();
		});

		it('calls _saveGeneralFeedback after all fields are filled', async () => {
			// arrange
			spyOn(securityServiceMock, 'sanitizeHtml').and.callFake((value) => value);
			const element = await setup();
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback').and.callThrough();

			const starsRatingPanel = element.shadowRoot.getElementById('rating');
			const ratingChangeEvent = new CustomEvent('change', {
				detail: { rating: Rating.GOOD }
			});
			starsRatingPanel.dispatchEvent(ratingChangeEvent);

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'description';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'email@some.com';
			emailInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveGeneralFeedbackSpy).toHaveBeenCalledWith(new GeneralFeedback('description', 'email@some.com', Rating.GOOD));
		});

		it('calls FeedbackService.save after all fields besides email are filled', async () => {
			// arrange
			const saveGeneralFeedbackSpy = spyOn(feedbackServiceMock, 'save');
			spyOn(securityServiceMock, 'sanitizeHtml').and.callFake((value) => value);
			const element = await setup();

			const starsRatingPanel = element.shadowRoot.getElementById('rating');
			const ratingChangeEvent = new CustomEvent('change', {
				detail: { rating: Rating.GOOD }
			});
			starsRatingPanel.dispatchEvent(ratingChangeEvent);

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'description';
			descriptionInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveGeneralFeedbackSpy).toHaveBeenCalledWith(new GeneralFeedback('description', null, Rating.GOOD));
		});
	});

	describe('when description is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const descriptionValue = 'description';
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = descriptionValue;
			descriptionInput.dispatchEvent(new Event('input'));

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(descriptionValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const descriptionValue = 'description';
			const element = await setup();

			// act
			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = descriptionValue;
			descriptionInput.dispatchEvent(new Event('input'));

			// assert
			const nodeValue = descriptionInput.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when email is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const emailValue = 'email@some.com';
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = emailValue;
			emailInput.dispatchEvent(new Event('input'));

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(emailValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const emailValue = 'email';
			const element = await setup();

			// act
			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = emailValue;
			emailInput.dispatchEvent(new Event('input'));

			// assert
			const nodeValue = emailInput.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when rating is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const ratingValue = Rating.EXCELLENT;
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			const starsRatingPanel = element.shadowRoot.getElementById('rating');
			const ratingChangeEvent = new CustomEvent('change', {
				detail: { rating: Rating.EXCELLENT }
			});
			starsRatingPanel.dispatchEvent(ratingChangeEvent);

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(ratingValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const element = await setup();

			// act
			const fiveButtonRatingElement = element.shadowRoot.getElementById('rating');
			const ratingChangeEvent = new CustomEvent('change', {
				detail: { rating: Rating.EXCELLENT }
			});
			fiveButtonRatingElement.dispatchEvent(ratingChangeEvent);

			// assert
			const nodeValue = fiveButtonRatingElement.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when using FeedbackService', () => {
		it('logs an error when save fails', async () => {
			// arrange
			const message = 'error message';
			const generalFeedbackSaveSpy = spyOn(feedbackServiceMock, 'save').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			// act
			await element._saveGeneralFeedback();

			// assert
			expect(generalFeedbackSaveSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
			expect(store.getState().notifications.latest.payload.content).toBe('feedback_generalFeedback_could_not_save');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});

		it('emits a success notification if save succeeds and calls the onClose callback', async () => {
			// arrange
			const onSubmitCallback = jasmine.createSpy();
			const generalFeedbackSaveSpy = spyOn(feedbackServiceMock, 'save').and.resolveTo(true);
			const element = await setup();
			element.onSubmit = onSubmitCallback;

			// act
			await element._saveGeneralFeedback();

			// assert
			expect(generalFeedbackSaveSpy).toHaveBeenCalled();
			expect(onSubmitCallback).toHaveBeenCalled();
			expect(store.getState().notifications.latest.payload.content).toBe('feedback_saved_successfully');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});
	});
});
