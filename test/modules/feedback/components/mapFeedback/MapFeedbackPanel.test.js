import { $injector } from '../../../../../src/injection';
import { MapFeedbackPanel } from '../../../../../src/modules/feedback/components/mapFeedback/MapFeedbackPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);

const configServiceMock = {
	getValueAsPath: () => {}
};

const mapFeedbackServiceMock = {
	getCategories: () => ['Foo', 'Bar'],
	save: () => {}
};

const setup = (state = {}) => {
	const initialState = {
		...state
	};

	TestUtils.setupStoreAndDi(initialState, {});

	$injector
		.registerSingleton('TranslationService', { translate: (key) => key })
		.registerSingleton('ConfigService', configServiceMock)
		.registerSingleton('MapFeedbackService', mapFeedbackServiceMock);

	return TestUtils.renderAndLogLifecycle(MapFeedbackPanel.tag);
};

describe('MapFeedbackPanel', () => {
	describe('when using MapFeedbackService', () => {
		it('logs an error when getCategories fails', async () => {
			// arrange
			const message = 'error message';
			const getMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'getCategories').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			// act
			await element._getCategorieOptions();

			// assert
			expect(getMapFeedbackSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
		});

		it('logs an error when save fails', async () => {
			// arrange
			const message = 'error message';
			const mapFeedbackSaveSpy = spyOn(mapFeedbackServiceMock, 'save').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			// act
			await element._saveMapFeedback('', '', '');

			// assert
			expect(mapFeedbackSaveSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
		});

		it('calls MapFeedbackService.getCategories()', async () => {
			// arrange
			const getMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'getCategories');
			const element = await setup();

			// act
			await element._getCategorieOptions();

			// assert
			expect(getMapFeedbackSpy).toHaveBeenCalled();
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_header';
			const expectedCategory = '';
			const expectedCategoryOptions = ['', 'Foo', 'Bar'];
			const expectedDescription = '';
			const expectedEmail = '';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(4);
			expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);

			const category = element.shadowRoot.querySelector('#category');
			expect(category.value).toBe(expectedCategory);
			const actualOptions = Array.from(category.querySelectorAll('option')).map((option) => option.value);
			expect(actualOptions).toEqual(expectedCategoryOptions);
			expect(element.shadowRoot.querySelector('#description').textContent).toBe(expectedDescription);
			expect(element.shadowRoot.querySelector('#email').textContent).toBe(expectedEmail);
		});
	});

	describe('when submit is pressed', () => {
		it('does not submit the form data if required fields are not filled', async () => {
			// arrange
			const element = await setup();
			const spy = jasmine.createSpy('feedback-form-submit');
			element.addEventListener('feedback-form-submit', spy);

			// act
			const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
			submitButton.click();

			expect(spy).not.toHaveBeenCalled();
		});

		it('submits the form data when the submit button is clicked after all fields are filled', async () => {
			// arrange
			const element = await setup();
			const spy = jasmine.createSpy('feedback-form-submit');
			element.addEventListener('feedback-form-submit', spy);

			const typeInput = element.shadowRoot.querySelector('#symbol');
			typeInput.checked = true;
			typeInput.dispatchEvent(new Event('change'));

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'this is some text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

			// act
			submitButton.click();

			// assert
			expect(spy).toHaveBeenCalled();
			expect(spy.calls.mostRecent().args[0].detail).toEqual({
				type: 'symbol',
				category: 'Foo',
				email: 'mail@some.com',
				description: 'this is some text'
			});
		});

		it('does not submit the form when the submit button is clicked, but email is invalid', async () => {
			// arrange
			const element = await setup();

			const spy = jasmine.createSpy('feedback-form-submit');
			element.addEventListener('feedback-form-submit', spy);

			const emailInput = element.shadowRoot.querySelector('#email');
			const descriptionInput = element.shadowRoot.querySelector('#description');
			const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

			emailInput.value = 'mail.some.com';
			descriptionInput.value = 'another text';

			// act
			submitButton.click();

			// assert
			expect(spy).not.toHaveBeenCalled();
		});

		it('calls MapFeedbackService.', async () => {
			// arrange
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');
			const element = await setup();

			const spy = jasmine.createSpy('feedback-form-submit');
			element.addEventListener('feedback-form-submit', spy);

			const typeInput = element.shadowRoot.querySelector('#symbol');
			const categorySelect = element.shadowRoot.querySelector('#category');
			const descriptionInput = element.shadowRoot.querySelector('#description');
			const emailInput = element.shadowRoot.querySelector('#email');
			const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

			typeInput.checked = true;
			categorySelect.value = 'Foo';
			descriptionInput.value = 'another text';
			emailInput.value = 'mail@some.com';

			// act
			submitButton.click();

			// assert
			expect(saveMapFeedbackSpy).toHaveBeenCalled();
			expect(spy).toHaveBeenCalled();
			expect(saveMapFeedbackSpy).toHaveBeenCalledWith({
				state: '',
				category: 'Foo',
				description: 'another text',
				email: 'mail@some.com',
				fileId: undefined
			});
		});
	});
});
