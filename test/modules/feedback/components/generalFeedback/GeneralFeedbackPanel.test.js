import { $injector } from '../../../../../src/injection';
import { GeneralFeedbackPanel } from '../../../../../src/modules/feedback/components/generalFeedback/GeneralFeedbackPanel';
import { Rating } from '../../../../../src/modules/feedback/components/rating/FiveButtonRating';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(GeneralFeedbackPanel.tag, GeneralFeedbackPanel);

const configServiceMock = {
	getValueAsPath: () => {}
};

const securityServiceMock = {
	sanitizeHtml: () => {}
};

const setup = (state = {}) => {
	const initialState = {
		media: {
			portrait: true
		},
		...state
	};

	TestUtils.setupStoreAndDi(initialState, {});

	$injector
		.registerSingleton('TranslationService', { translate: (key) => key })
		.registerSingleton('ConfigService', configServiceMock)
		// .registerSingleton('FeedbackService', feedbackServiceMock)
		// .registerSingleton('ShareService', shareServiceMock)
		// .registerSingleton('FileStorageService', fileStorageServiceMock)
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
					state: null,
					category: null,
					description: null,
					email: null
				},
				isPortrait: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_mapFeedback_header';
			const expectedDescription = '';
			const expectedEmail = '';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(3);
			expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);

			expect(element.shadowRoot.querySelector('#description').textContent).toBe(expectedDescription);
			expect(element.shadowRoot.querySelector('#email').textContent).toBe(expectedEmail);
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
			expect(descriptionElement.getAttribute('maxlength')).toBe('10000');
			expect(descriptionElement.parentElement.querySelector('label').innerText).toBe('feedback_mapFeedback_changeDescription');

			expect(emailElement.type).toBe('email');
			expect(emailElement.hasAttribute('placeholder')).toBeTrue;
			expect(emailElement.parentElement.querySelector('label').innerText).toBe('feedback_mapFeedback_eMail');
			expect(descriptionElement.hasAttribute('placeholder')).toBeFalse;
		});

		it('renders a privacy policy disclaimer', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer').innerText).toContain('feedback_mapFeedback_disclaimer');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').href).toContain('global_privacy_policy_url');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').innerText).toBe('feedback_mapFeedback_privacyPolicy');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').target).toBe('_blank');
		});

		it('gets the correct elements from _allInvolvedElements', async () => {
			// arrange
			const element = await setup();

			const allInvolvedElements = element._allInvolvedElements();

			const nodeValues = [];
			allInvolvedElements.forEach((element) => {
				if (element.attributes.length === 1) {
					nodeValues.push(element.attributes['class'].nodeValue);
				}
				if (element.attributes.length > 1) {
					nodeValues.push(element.attributes['id'].nodeValue);
				}
			});

			// assert
			expect(element._allInvolvedElements).toBeDefined();
			expect(allInvolvedElements.length).toBe(4);
			expect(nodeValues.length).toBe(4);
			expect(nodeValues.includes('map-feedback__iframe')).toBeTrue();
			expect(nodeValues.includes('description-form-element')).toBeTrue();
			expect(nodeValues.includes('category-form-element')).toBeTrue();
			expect(nodeValues.includes('email-form-element')).toBeTrue();
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

			// const fiveButtonRating = element.shadowRoot.querySelector('#rating');
			// fiveButtonRating.value = Rating.BAD;
			// fiveButtonRating.dispatchEvent(new Event('rating'));

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
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback');

			const fiveButtonRating = element.shadowRoot.getElementById('rating');
			const ratingChangeEvent = new CustomEvent('rating', {
				detail: { rating: Rating.GOOD }
			});
			fiveButtonRating.dispatchEvent(ratingChangeEvent);

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
			expect(saveGeneralFeedbackSpy).toHaveBeenCalled();
			expect(saveGeneralFeedbackSpy).toHaveBeenCalledWith({ description: 'description', rating: Rating.GOOD, email: 'email@some.com' });
		});

		it('calls FeedbackService.save after all fields besides email are filled', async () => {
			// arrange
			spyOn(securityServiceMock, 'sanitizeHtml').and.callFake((value) => value);
			const element = await setup();
			const saveGeneralFeedbackSpy = spyOn(element, '_saveGeneralFeedback');

			const fiveButtonRating = element.shadowRoot.getElementById('rating');
			const ratingChangeEvent = new CustomEvent('rating', {
				detail: { rating: Rating.GOOD }
			});
			fiveButtonRating.dispatchEvent(ratingChangeEvent);

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'description';
			descriptionInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveGeneralFeedbackSpy).toHaveBeenCalled();
			expect(saveGeneralFeedbackSpy).toHaveBeenCalledWith({ description: 'description', rating: Rating.GOOD, email: '' });
		});
	});

	// describe('when description is changed', () => {
	// 	it('sanitizes the input value', async () => {
	// 		arrange
	// 		const descriptionValue = 'description';
	// 		const element = await setup();
	// 		const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

	// 		act
	// 		const descriptionInput = element.shadowRoot.querySelector('#description');
	// 		descriptionInput.value = descriptionValue;
	// 		descriptionInput.dispatchEvent(new Event('input'));

	// 		assert
	// 		expect(sanitizeSpy).toHaveBeenCalledWith(descriptionValue);
	// 	});

	// 	it('its parent receives the "wasTouched" class', async () => {
	// 		arrange
	// 		const descriptionValue = 'description';
	// 		const element = await setup();

	// 		act
	// 		const descriptionInput = element.shadowRoot.querySelector('#description');
	// 		descriptionInput.value = descriptionValue;
	// 		descriptionInput.dispatchEvent(new Event('input'));

	// 		assert
	// 		const nodeValue = descriptionInput.parentElement.attributes['class'].nodeValue;
	// 		expect(nodeValue.includes('wasTouched')).toBeTrue();
	// 	});
	// });

	// describe('when email is changed', () => {
	// 	it('sanitizes the input value', async () => {
	// 		arrange
	// 		const emailValue = 'email@some.com';
	// 		const element = await setup();
	// 		const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

	// 		act
	// 		const emailInput = element.shadowRoot.querySelector('#email');
	// 		emailInput.value = emailValue;
	// 		emailInput.dispatchEvent(new Event('input'));

	// 		assert
	// 		expect(sanitizeSpy).toHaveBeenCalledWith(emailValue);
	// 	});
	// });

	// describe('when category is changed', () => {
	// 	it('sanitizes the input value', async () => {
	// 		arrange
	// 		const categoryValue = 'Bar';
	// 		const element = await setup();
	// 		const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

	// 		act
	// 		const categorySelect = element.shadowRoot.querySelector('#category');
	// 		categorySelect.value = categoryValue;
	// 		categorySelect.dispatchEvent(new Event('change'));

	// 		assert
	// 		expect(sanitizeSpy).toHaveBeenCalledWith(categoryValue);
	// 	});

	// 	it('its parent receives the "wasTouched" class', async () => {
	// 		arrange
	// 		const categoryValue = 'Bar';
	// 		const element = await setup();

	// 		act
	// 		const categorySelect = element.shadowRoot.querySelector('#category');
	// 		categorySelect.value = categoryValue;
	// 		categorySelect.dispatchEvent(new Event('change'));

	// 		assert
	// 		const nodeValue = categorySelect.parentElement.attributes['class'].nodeValue;
	// 		expect(nodeValue.includes('wasTouched')).toBeTrue();
	// 	});
	// });

	// describe('responsive layout ', () => {
	// 	it('layouts for landscape', async () => {
	// 		const state = {
	// 			media: {
	// 				portrait: false
	// 			}
	// 		};

	// 		const element = await setup(state);

	// 		expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
	// 		expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
	// 	});

	// 	it('layouts for portrait ', async () => {
	// 		const state = {
	// 			media: {
	// 				portrait: true
	// 			}
	// 		};

	// 		const element = await setup(state);

	// 		expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
	// 		expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
	// 	});
	// });
});
