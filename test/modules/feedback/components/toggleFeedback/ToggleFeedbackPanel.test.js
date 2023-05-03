import { $injector } from '../../../../../src/injection';
import { ToggleFeedbackPanel } from '../../../../../src/modules/feedback/components/toggleFeedback/ToggleFeedbackPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ToggleFeedbackPanel.tag, ToggleFeedbackPanel);

const setup = (state = {}) => {
	const initialState = {
		...state
	};

	TestUtils.setupStoreAndDi(initialState);

	$injector.registerSingleton('TranslationService', { translate: (key) => key });

	return TestUtils.renderAndLogLifecycle(ToggleFeedbackPanel.tag);
};

describe('MapFeedbackPanel', () => {
	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new ToggleFeedbackPanel();

			expect(element.getModel()).toEqual({
				selectedFeedbackPanel: null
			});
		});

		it('has default callback methods', async () => {
			await setup();
			const instanceUnderTest = new ToggleFeedbackPanel();

			expect(instanceUnderTest._onSubmit).toBeDefined();
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedMapButton = 'feedback_toggleFeedback_mapButton';
			const expectedMapButtonSub = 'feedback_toggleFeedback_mapButton_sub';
			const expectedGeneralButton = 'feedback_toggleFeedback_generalButton';
			const expectedGeneralButtonSub = 'feedback_toggleFeedback_generalButton_sub';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(5);

			const mapButtonContainer = element.shadowRoot.querySelector('.toggleButtons');
			expect(window.getComputedStyle(mapButtonContainer).getPropertyValue('display')).toBe('block');

			expect(element.shadowRoot.querySelectorAll('#feedbackMapButton .map')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#feedbackMapButton .ba-list-item__primary-text').innerText).toBe(expectedMapButton);
			expect(element.shadowRoot.querySelector('#feedbackMapButton .ba-list-item__secondary-text').innerText).toBe(expectedMapButtonSub);

			expect(element.shadowRoot.querySelectorAll('#feedbackGeneralButton .chatleftdots')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#feedbackGeneralButton .ba-list-item__primary-text').innerText).toBe(expectedGeneralButton);
			expect(element.shadowRoot.querySelector('#feedbackGeneralButton .ba-list-item__secondary-text').innerText).toBe(expectedGeneralButtonSub);

			const mapPanel = element.shadowRoot.querySelector('.toggleMap');
			expect(window.getComputedStyle(mapPanel).getPropertyValue('display')).toBe('none');
			expect(element.shadowRoot.querySelectorAll('ba-mvu-feedbackpanel')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('ba-mvu-feedbackpanel').onSubmit).toEqual(element._onSubmit);

			const generalPanel = element.shadowRoot.querySelector('.toggleGeneral');
			expect(window.getComputedStyle(generalPanel).getPropertyValue('display')).toBe('none');
		});
	});

	describe('when map button is pressed', () => {
		it('shows the map feedback panel', async () => {
			// arrange
			const element = await setup();

			// act
			const mapButton = element.shadowRoot.querySelector('#feedbackMapButton');
			mapButton.click();

			// assert
			const mapButtonContainer = element.shadowRoot.querySelector('.toggleButtons');
			expect(window.getComputedStyle(mapButtonContainer).getPropertyValue('display')).toBe('none');

			const mapPanel = element.shadowRoot.querySelector('.toggleMap');
			expect(window.getComputedStyle(mapPanel).getPropertyValue('display')).toBe('block');

			const generalPanel = element.shadowRoot.querySelector('.toggleGeneral');
			expect(window.getComputedStyle(generalPanel).getPropertyValue('display')).toBe('none');
		});
	});

	describe('when general button is pressed', () => {
		it('shows the general feedback panel', async () => {
			// arrange
			const element = await setup();

			// act
			const generalButton = element.shadowRoot.querySelector('#feedbackGeneralButton');
			generalButton.click();

			// assert
			const mapButtonContainer = element.shadowRoot.querySelector('.toggleButtons');
			expect(window.getComputedStyle(mapButtonContainer).getPropertyValue('display')).toBe('none');

			const mapPanel = element.shadowRoot.querySelector('.toggleMap');
			expect(window.getComputedStyle(mapPanel).getPropertyValue('display')).toBe('none');

			const generalPanel = element.shadowRoot.querySelector('.toggleGeneral');
			expect(window.getComputedStyle(generalPanel).getPropertyValue('display')).toBe('block');
		});
	});
});
