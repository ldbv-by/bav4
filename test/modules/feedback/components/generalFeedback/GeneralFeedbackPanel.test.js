import { $injector } from '../../../../../src/injection';
import { GeneralFeedbackPanel } from '../../../../../src/modules/feedback/components/generalFeedback/GeneralFeedbackPanel';
import { Rating } from '../../../../../src/modules/feedback/components/rating/LikertItemRatingPanel';
import { GeneralFeedback } from '../../../../../src/services/FeedbackService';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../../src/utils/markup';
import { TestUtils } from '../../../../test-utils';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';

window.customElements.define(GeneralFeedbackPanel.tag, GeneralFeedbackPanel);

const ratingValue = Rating.STRONGLY_AGREE;
const fillRating = (element) => {
	const starsRatingPanel = element.shadowRoot.getElementById('rating');
	const ratingChangeEvent = new CustomEvent('change', {
		detail: { rating: ratingValue }
	});
	starsRatingPanel.dispatchEvent(ratingChangeEvent);
	return starsRatingPanel;
};

const categoryValue = 'Foo';
const fillCategory = (element) => {
	const categorySelectElement = element.shadowRoot.querySelector('#category');
	categorySelectElement.value = categoryValue;
	categorySelectElement.dispatchEvent(new Event('change'));
	return categorySelectElement;
};

const descriptionValue = 'description';
const fillDescription = (element) => {
	const descriptionInputElement = element.shadowRoot.querySelector('#description');
	descriptionInputElement.value = descriptionValue;
	descriptionInputElement.dispatchEvent(new Event('input'));
	return descriptionInputElement;
};

const emailValue = 'mail@some.com';
const fillEmail = (element, value = emailValue) => {
	const emailInputElement = element.shadowRoot.querySelector('#email');
	emailInputElement.value = value;
	emailInputElement.dispatchEvent(new Event('input'));
	return emailInputElement;
};

const configServiceMock = {
	getValueAsPath: () => {}
};

const feedbackServiceMock = {
	getGeneralFeedbackCategories: () => ['Foo', 'Bar'],
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
					category: null,
					description: null,
					email: null,
					rating: null
				},
				categoryOptions: []
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_generalFeedback';
			const expectedCategory = '';
			const expectedCategoryOptions = ['', 'Foo', 'Bar'];
			const expectedDescription = '';
			const expectedEmail = '';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(10);
			expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);
			const category = element.shadowRoot.querySelector('#category');
			expect(category.value).toBe(expectedCategory);
			const actualOptions = Array.from(category.querySelectorAll('option')).map((option) => option.value);
			expect(actualOptions).toEqual(expectedCategoryOptions);
			expect(element.shadowRoot.querySelector('#description').textContent).toBe(expectedDescription);
			expect(element.shadowRoot.querySelector('#email').textContent).toBe(expectedEmail);
			expect(element.shadowRoot.querySelectorAll('ba-likert-item-rating-panel')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.feedback-text-container').childElementCount).toBe(2);
			expect(element.shadowRoot.querySelectorAll('.feedback-text-container span')[0].textContent).toBe('feedback_generalFeedback_rating_scale_5');
			expect(element.shadowRoot.querySelectorAll('.feedback-text-container span')[1].textContent).toBe('feedback_generalFeedback_rating_scale_0');
		});

		it('renders form elements containing correct attributes', async () => {
			// arrange
			const element = await setup();

			const ratingElement = element.shadowRoot.querySelector('#rating');
			const categoryElement = element.shadowRoot.querySelector('#category');
			const descriptionElement = element.shadowRoot.querySelector('#description');
			const emailElement = element.shadowRoot.querySelector('#email');
			const submitElement = element.shadowRoot.querySelector('#button0');

			// assert
			expect(ratingElement.hasAttribute('required')).toBeFalse();

			expect(categoryElement.type).toBe('select-one');
			expect(categoryElement.hasAttribute('required')).toBeTrue();
			expect(categoryElement.parentElement.querySelector('label').innerText).toBe('feedback_categorySelection');

			expect(descriptionElement.type).toBe('textarea');
			expect(descriptionElement.hasAttribute('required')).toBeTrue();
			expect(descriptionElement.getAttribute('placeholder')).toBe('feedback_changeDescription');
			expect(descriptionElement.parentElement.querySelector('label').innerText).toBe('feedback_changeDescription');

			expect(emailElement.type).toBe('email');
			expect(emailElement.getAttribute('placeholder')).toBe('feedback_eMail');
			expect(emailElement.parentElement.querySelector('label').innerText).toBe('feedback_eMail');

			expect(submitElement.type).toBe('primary');
			expect(submitElement.label).toBe('feedback_submit');
		});

		it('contains 4 unvisited ba-form-elements', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.ba-form-element')).toHaveSize(4);
			element.shadowRoot.querySelectorAll('.ba-form-element').forEach((el) => {
				expect(el.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS)).toBeFalse();
			});
		});

		it('renders a privacy policy disclaimer', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#generalFeedback_disclaimer').innerText).toContain('feedback_disclaimer');
			expect(element.shadowRoot.querySelector('#generalFeedback_disclaimer a').href).toContain('global_privacy_policy_url');
			expect(element.shadowRoot.querySelector('#generalFeedback_disclaimer a').innerText).toBe('feedback_privacyPolicy');
			expect(element.shadowRoot.querySelector('#generalFeedback_disclaimer a').target).toBe('_blank');
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

			fillCategory(element);
			fillEmail(element);
			fillRating(element);

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveGeneralFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call _saveGeneralFeedback if email is set but not valid', async () => {
			// arrange
			const element = await setup();
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback');

			fillCategory(element);
			fillDescription(element);
			fillEmail(element, 'no email');
			fillRating(element);

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

			fillCategory(element);
			fillDescription(element);
			fillEmail(element);
			fillRating(element);

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveGeneralFeedbackSpy).toHaveBeenCalledWith(new GeneralFeedback(categoryValue, descriptionValue, emailValue, ratingValue));
		});

		it('calls FeedbackService.save after all fields besides email are filled', async () => {
			// arrange
			const saveGeneralFeedbackSpy = spyOn(feedbackServiceMock, 'save');
			spyOn(securityServiceMock, 'sanitizeHtml').and.callFake((value) => value);
			const element = await setup();

			fillCategory(element);
			fillDescription(element);
			fillRating(element);

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveGeneralFeedbackSpy).toHaveBeenCalledWith(new GeneralFeedback(categoryValue, descriptionValue, null, ratingValue));
		});
	});

	describe('when category is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			fillCategory(element);

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(categoryValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const element = await setup();

			// act
			const categoryPanel = fillDescription(element);

			// assert
			const nodeValue = categoryPanel.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when description is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			fillDescription(element);

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(descriptionValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const element = await setup();

			// act
			const descriptionInput = fillDescription(element);

			// assert
			const nodeValue = descriptionInput.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when email is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			fillEmail(element);

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(emailValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const element = await setup();

			// act
			const emailInput = fillEmail(element);

			// assert
			const nodeValue = emailInput.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when rating is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			fillRating(element);

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(ratingValue);
		});

		it('its parent receives the "userVisited" class', async () => {
			// arrange
			const element = await setup();

			// act
			const fiveButtonRatingElement = fillRating(element);

			// assert
			const nodeValue = fiveButtonRatingElement.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
		});
	});

	describe('when using FeedbackService', () => {
		it('logs an error when getGeneralFeedbackCategories fails', async () => {
			// arrange
			const message = 'error message';
			const getGeneralFeedbackSpy = spyOn(feedbackServiceMock, 'getGeneralFeedbackCategories').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			// act
			await element._getCategoryOptions();

			// assert
			expect(getGeneralFeedbackSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
		});

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
