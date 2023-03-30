import { $injector } from '../../../../../src/injection';
import { MapFeedbackPanel } from '../../../../../src/modules/feedback/components/mapFeedback/MapFeedbackPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);

const configServiceMock = {
	getValueAsPath: () => {}
};

const mapFeedbackServiceMock = {
	getCategories: () => ['Foo', 'Bar']
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
			const message = 'error message';
			const getMapFeedbackSpy = spyOn(mapFeedbackServiceMock, 'getCategories').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			await element._getCategorieOptions();

			expect(getMapFeedbackSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
		});
	});

	it('should render Title of the component', async () => {
		const expectedTitle = 'feedback_header';
		const element = await setup();
		expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);
	});

	it('does not submit the form data if required fields are not filled', async () => {
		const element = await setup();
		const spy = jasmine.createSpy('feedback-form-submit');
		element.addEventListener('feedback-form-submit', spy);

		const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
		submitButton.click();

		expect(spy).not.toHaveBeenCalled();
	});

	it('submits the form data when the submit button is clicked after all fields are filled', async () => {
		const element = await setup();
		const spy = jasmine.createSpy('feedback-form-submit');
		element.addEventListener('feedback-form-submit', spy);

		const typeInput = element.shadowRoot.querySelector('#symbol');
		typeInput.checked = true;
		typeInput.dispatchEvent(new Event('change'));

		const categorySelect = element.shadowRoot.querySelector('#category');
		categorySelect.value = 'Foo';
		categorySelect.dispatchEvent(new Event('change'));

		const messageInput = element.shadowRoot.querySelector('#message');
		messageInput.value = 'this is some text';
		messageInput.dispatchEvent(new Event('input'));

		const emailInput = element.shadowRoot.querySelector('#email');
		emailInput.value = 'mail@some.com';
		emailInput.dispatchEvent(new Event('input'));

		const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

		submitButton.click();

		expect(spy).toHaveBeenCalled();
		expect(spy.calls.mostRecent().args[0].detail).toEqual({
			type: 'symbol',
			category: 'Foo',
			email: 'mail@some.com',
			message: 'this is some text'
		});
	});

	it('does not submit the form when the submit button is clicked, but email is invalid', async () => {
		const element = await setup();

		const spy = jasmine.createSpy('feedback-form-submit');
		element.addEventListener('feedback-form-submit', spy);

		const emailInput = element.shadowRoot.querySelector('#email');
		const messageInput = element.shadowRoot.querySelector('#message');
		const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

		emailInput.value = 'mail.some.com';
		messageInput.value = 'another text';

		submitButton.click();

		expect(spy).not.toHaveBeenCalled();
	});
});
