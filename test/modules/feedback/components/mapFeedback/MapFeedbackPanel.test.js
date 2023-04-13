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

		it('the fields category and description are required fields of the correct type', async () => {
			// arrange
			const element = await setup();

			const category = element.shadowRoot.querySelector('select[name="category"]');
			const description = element.shadowRoot.querySelector('textarea[name="description"]');

			// assert
			expect(category).not.toBeNull();
			expect(category.type).toBe('select-one');
			expect(category.getAttribute('required')).toBe('');
			expect(description).not.toBeNull();
			expect(description.type).toBe('textarea');
			expect(description.getAttribute('required')).toBe('');
		});
	});

	describe('when submit is pressed', () => {
		it('does not call MapFeedbackService.save if required fields are not filled', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call MapFeedbackService.save if category is not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call MapFeedbackService.save if description is not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call MapFeedbackService.save if email is not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('calls MapFeedbackService.save after all fields are filled', async () => {
			// arrange
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');
			const element = await setup();

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveMapFeedbackSpy).toHaveBeenCalled();
			expect(saveMapFeedbackSpy).toHaveBeenCalledWith({
				state: '',
				category: 'Foo',
				description: 'another text',
				email: 'mail@some.com',
				fileId: ''
			});
		});
	});
});
