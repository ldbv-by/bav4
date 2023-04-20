import { $injector } from '../../../../../src/injection';
import { MapFeedbackPanel } from '../../../../../src/modules/feedback/components/mapFeedback/MapFeedbackPanel';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);

const configServiceMock = {
	getValueAsPath: () => {}
};

const mapFeedbackServiceMock = {
	getCategories: () => ['Foo', 'Bar'],
	save: () => {}
};

let store;

const setup = (state = {}) => {
	const initialState = {
		...state
	};

	store = TestUtils.setupStoreAndDi(initialState, {
		notifications: notificationReducer
	});

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

			expect(store.getState().notifications.latest.payload.content).toBe('feedback_could_not_save');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});

		it('emits a success notification if save succeeds', async () => {
			// arrange
			const mapFeedbackSaveSpy = spyOn(mapFeedbackServiceMock, 'save').and.resolveTo(true);
			const element = await setup();

			// act
			await element._saveMapFeedback('', '', '');

			// assert
			expect(mapFeedbackSaveSpy).toHaveBeenCalled();

			expect(store.getState().notifications.latest.payload.content).toBe('feedback_saved_successfully');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
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

		it('renders form elements containing correct attributes', async () => {
			// arrange
			const element = await setup();

			const categoryElement = element.shadowRoot.querySelector('#category');
			const descriptionElement = element.shadowRoot.querySelector('#description');
			const emailElement = element.shadowRoot.querySelector('#email');

			// assert
			expect(categoryElement.type).toBe('select-one');
			expect(categoryElement.hasAttribute('required')).toBeTrue;
			expect(categoryElement.hasAttribute('placeholder')).toBeTrue;

			expect(descriptionElement.type).toBe('textarea');
			expect(descriptionElement.hasAttribute('required')).toBeTrue;
			expect(descriptionElement.hasAttribute('placeholder')).toBeTrue;

			expect(emailElement.type).toBe('email');
			expect(emailElement.hasAttribute('placeholder')).toBeTrue;
		});

		it('renders a privacy policy disclaimer', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#feedback_disclaimer').innerText).toContain('feedback_disclaimer');
			expect(element.shadowRoot.querySelector('#feedback_disclaimer a').href).toContain('global_privacy_policy_url');
			expect(element.shadowRoot.querySelector('#feedback_disclaimer a').innerText).toBe('feedback_privacyPolicy');
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

		it('does not call MapFeedbackService.save if geometry is not set', async () => {
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

		it('does not call MapFeedbackService.save if email is set and not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'no email';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('calls MapFeedbackService.save after all fields are filled', async () => {
			// arrange
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');
			const element = await setup();

			element.toggleFileId('123');

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
				fileId: '123'
			});
		});

		it('calls MapFeedbackService.save after all fields besides email are filled', async () => {
			// arrange
			const saveMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'save');
			const element = await setup();

			element.toggleFileId('123');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveMapFeedbackSpy).toHaveBeenCalled();
			expect(saveMapFeedbackSpy).toHaveBeenCalledWith({
				state: '',
				category: 'Foo',
				description: 'another text',
				email: '',
				fileId: '123'
			});
		});
	});
});
