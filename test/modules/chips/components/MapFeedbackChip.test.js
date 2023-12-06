import { $injector } from '../../../../src/injection';
import { FeedbackType, ToggleFeedbackPanel } from '../../../../src/modules/feedback/components/toggleFeedback/ToggleFeedbackPanel';
import { MapFeedbackChip } from '../../../../src/modules/chips/components/assistChips/MapFeedbackChip';
import mapSvg from '../../../../src/modules/chips/components/assistChips/assets/map.svg';
import { closeModal } from '../../../../src/store/modal/modal.action';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(MapFeedbackChip.tag, MapFeedbackChip);
describe('MapFeedbackChip', () => {
	let store;

	const setup = async () => {
		store = TestUtils.setupStoreAndDi({}, { modal: modalReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(MapFeedbackChip.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({ center: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('chips_assist_chip_map_feedback_label');
			expect(element.getIcon()).toBe(mapSvg);
		});
	});

	describe('when initialized', () => {
		it('renders the view with given center', async () => {
			const element = await setup();
			element.center = [42, 21];

			expect(element.isVisible()).toBeTrue();
		});

		it('does NOT renders the view with missing center', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
		it('opens the modal with the toggleFeedbackPanel', async () => {
			const expectedCenter = [42, 21];
			const element = await setup();
			element.center = expectedCenter;

			const button = element.shadowRoot.querySelector('button');
			button.click();

			await TestUtils.timeout();

			expect(store.getState().modal.data.title).toBe('chips_assist_chip_map_feedback_title');
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElement.querySelectorAll(ToggleFeedbackPanel.tag)).toHaveSize(1);
			expect(wrapperElement.querySelector(ToggleFeedbackPanel.tag).onSubmit).toEqual(closeModal);
			expect(wrapperElement.querySelector(ToggleFeedbackPanel.tag).center).toEqual(expectedCenter);
			expect(wrapperElement.querySelector(ToggleFeedbackPanel.tag).type).toEqual(FeedbackType.MAP);
		});
	});
});
