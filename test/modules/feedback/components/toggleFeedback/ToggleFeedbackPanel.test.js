import { $injector } from '../../../../../src/injection';
import { GeneralFeedbackPanel } from '../../../../../src/modules/feedback/components/generalFeedback/GeneralFeedbackPanel';
import { MapFeedbackPanel } from '../../../../../src/modules/feedback/components/mapFeedback/MapFeedbackPanel';
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

describe('ToggleFeedbackPanel', () => {
	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new ToggleFeedbackPanel();

			expect(element.getModel()).toEqual({
				selectedFeedbackPanel: null,
				center: null
			});
		});

		it('has default callback methods', async () => {
			await setup();
			const instanceUnderTest = new ToggleFeedbackPanel();

			expect(instanceUnderTest._onSubmit).toBeDefined();
			expect(instanceUnderTest._onSubmit()).toBeUndefined();
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedMapButton = 'feedback_mapFeedback';
			const expectedMapButtonSub = 'feedback_toggleFeedback_mapButton_sub';
			const expectedGeneralButton = 'feedback_generalFeedback';
			const expectedGeneralButtonSub = 'feedback_toggleFeedback_generalButton_sub';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(3);

			const mapButtonContainer = element.shadowRoot.querySelector('.toggleButtons');
			expect(window.getComputedStyle(mapButtonContainer).getPropertyValue('display')).toBe('block');

			expect(element.shadowRoot.querySelectorAll('#feedbackMapButton .map')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#feedbackMapButton .ba-list-item__primary-text').innerText).toBe(expectedMapButton);
			expect(element.shadowRoot.querySelector('#feedbackMapButton .ba-list-item__secondary-text').innerText).toBe(expectedMapButtonSub);

			expect(element.shadowRoot.querySelectorAll('#feedbackGeneralButton .chatleftdots')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#feedbackGeneralButton .ba-list-item__primary-text').innerText).toBe(expectedGeneralButton);
			expect(element.shadowRoot.querySelector('#feedbackGeneralButton .ba-list-item__secondary-text').innerText).toBe(expectedGeneralButtonSub);

			expect(element.shadowRoot.querySelectorAll(MapFeedbackPanel.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(GeneralFeedbackPanel.tag)).toHaveSize(0);
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
			expect(element.shadowRoot.querySelectorAll('.toggleButtons')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(MapFeedbackPanel.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(GeneralFeedbackPanel.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelector(MapFeedbackPanel.tag).onSubmit).toEqual(element._onSubmit);
			expect(element.shadowRoot.querySelector(MapFeedbackPanel.tag).center).toBeNull();
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
			expect(element.shadowRoot.querySelectorAll('.toggleButtons')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(MapFeedbackPanel.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(GeneralFeedbackPanel.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelector(GeneralFeedbackPanel.tag).onSubmit).toEqual(element._onSubmit);
		});
	});

	describe('property "type"', () => {
		it('updates the view', async () => {
			// arrange
			const element = await setup();

			//act
			element.type = FeedbackType.GENERAL;

			// assert
			expect(element.shadowRoot.querySelectorAll('.toggleButtons')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(MapFeedbackPanel.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(GeneralFeedbackPanel.tag)).toHaveSize(1);

			//act
			element.type = FeedbackType.MAP;

			expect(element.shadowRoot.querySelectorAll('.toggleButtons')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(MapFeedbackPanel.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(GeneralFeedbackPanel.tag)).toHaveSize(0);
		});
	});

	describe('property "onSubmit"', () => {
		it('sets the onSubmit callback', async () => {
			const onSubmbitFn = () => {};
			const element = await setup();

			element.onSubmit = onSubmbitFn;

			expect(element._onSubmit).toEqual(onSubmbitFn);
		});
	});

	describe('property "center"', () => {
		it('sets the center coordinate and updates the view', async () => {
			const element = await setup();
			element.type = FeedbackType.MAP;

			element.center = [21, 42];

			expect(element.shadowRoot.querySelector(MapFeedbackPanel.tag).center).toEqual([21, 42]);
		});
	});
});
