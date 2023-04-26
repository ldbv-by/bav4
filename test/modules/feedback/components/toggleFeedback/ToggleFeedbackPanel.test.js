import { $injector } from '../../../../../src/injection';
import { FeedbackType, ToggleFeedbackPanel } from '../../../../../src/modules/feedback/components/toggleFeedback/ToggleFeedbackPanel';
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
	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new ToggleFeedbackPanel();

			expect(element.getModel()).toEqual({
				selectedFeedbackPanel: FeedbackType.NONE
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_toggleFeedback_header';
			const expectedMapButton = 'feedback_toggleFeedback_mapButton';
			const expectedGeneralButton = 'feedback_toggleFeedback_generalButton';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(5);
			const panelTitle = element.shadowRoot.querySelector('#toggleFeedbackPanelTitle');
			expect(panelTitle.textContent).toBe(expectedTitle);

			const mapButtonContainer = element.shadowRoot.querySelector('.toggleButtons');
			expect(window.getComputedStyle(mapButtonContainer).getPropertyValue('display')).toBe('block');

			expect(element.shadowRoot.querySelector('#feedbackMapButton').label).toBe(expectedMapButton);
			expect(element.shadowRoot.querySelector('#feedbackGeneralButton').label).toBe(expectedGeneralButton);

			const mapPanel = element.shadowRoot.querySelector('.toggleMap');
			expect(window.getComputedStyle(mapPanel).getPropertyValue('display')).toBe('none');

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
