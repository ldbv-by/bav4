import { MapFeedbackPanel } from '../../../../../src/modules/feedback/components/mapFeedback/MapFeedbackPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);

const setupStoreAndDi = () => {
	TestUtils.setupStoreAndDi();
};
describe('FeedbackPanel', () => {
	beforeEach(() => {
		setupStoreAndDi();
	});

	it('should render Title of the component', async () => {
		const expectedTitle = 'Feedback';
		const element = await TestUtils.render(MapFeedbackPanel.tag);
		expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);
	});

	it('does not submit the form data if required fields are not filled', async () => {
		const element = await TestUtils.render(MapFeedbackPanel.tag);
		const spy = jasmine.createSpy('feedback-form-submit');
		element.addEventListener('feedback-form-submit', spy);

		const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
		submitButton.click();

		expect(spy).not.toHaveBeenCalled();
	});

	it('submits the form data when the submit button is clicked', async () => {
		const element = await TestUtils.render(MapFeedbackPanel.tag);
		const spy = jasmine.createSpy('feedback-form-submit');
		element.addEventListener('feedback-form-submit', spy);

		const expectedTopic = 'one text';
		const topicInput = element.shadowRoot.querySelector('#topic');
		const emailInput = element.shadowRoot.querySelector('#email');
		const messageInput = element.shadowRoot.querySelector('#message');
		const ageInput = element.shadowRoot.querySelector('#age');
		const reasonInput = element.shadowRoot.querySelector('#reason');
		const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

		topicInput.value = expectedTopic;
		topicInput.dispatchEvent(new Event('input'));
		emailInput.value = 'mail@some.com';
		emailInput.dispatchEvent(new Event('input'));
		messageInput.value = 'another text';
		ageInput.value = '21';
		ageInput.dispatchEvent(new Event('input'));
		reasonInput.value = 'missing';
		reasonInput.dispatchEvent(new Event('change'));

		submitButton.click();

		expect(spy).toHaveBeenCalled();
		expect(spy.calls.mostRecent().args[0].detail).toEqual({
			topic: 'one text',
			email: 'mail@some.com',
			message: 'another text',
			age: '21',
			reason: 'missing'
		});
	});

	it('does not submit the form when the submit button is clicked, but email is invalid', async () => {
		const element = await TestUtils.render(MapFeedbackPanel.tag);
		const spy = jasmine.createSpy('feedback-form-submit');
		element.addEventListener('feedback-form-submit', spy);

		const expectedTopic = 'one text';
		const topicInput = element.shadowRoot.querySelector('#topic');
		const emailInput = element.shadowRoot.querySelector('#email');
		const messageInput = element.shadowRoot.querySelector('#message');
		const ageInput = element.shadowRoot.querySelector('#age');
		const reasonInput = element.shadowRoot.querySelector('#reason');
		const submitButton = element.shadowRoot.querySelector('button[type="submit"]');

		topicInput.value = expectedTopic;
		emailInput.value = 'mail.some.com';
		messageInput.value = 'another text';
		ageInput.value = '21';
		reasonInput.value = 'missing';

		submitButton.click();

		expect(spy).not.toHaveBeenCalled();
	});
});
