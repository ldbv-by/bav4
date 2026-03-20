import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';
import { FeedbackBanner } from '../../../../src/modules/routing/components/feedbackBanner/FeedbackBanner';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { setStatus } from '../../../../src/store/routing/routing.action';
import { $injector } from '../../../../src/injection';

window.customElements.define(FeedbackBanner.tag, FeedbackBanner);

describe('FeedbackBanner', () => {
	const setup = (state = {}) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};
		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer(),
			routing: routingReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(FeedbackBanner.tag);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new FeedbackBanner().getModel();

			expect(model).toEqual({
				status: null
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			setStatus(200);

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('renders status', async () => {
			const element = await setup();

			setStatus(900); // RoutingStatusCodes.Start_Destination_Missing

			expect(element.shadowRoot.querySelector('.icon').classList.contains('icon-status-900')).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('span')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('span')[0].innerText).toBe('routing_feedback_900');

			setStatus(901); // RoutingStatusCodes.Destination_Missing

			expect(element.shadowRoot.querySelector('.icon').classList.contains('icon-status-901')).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('span')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('span')[0].innerText).toBe('routing_feedback_901');

			setStatus(902); // RoutingStatusCodes.Start_Missing

			expect(element.shadowRoot.querySelector('.icon').classList.contains('icon-status-902')).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('span')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('span')[0].innerText).toBe('routing_feedback_902');
		});
	});
});
