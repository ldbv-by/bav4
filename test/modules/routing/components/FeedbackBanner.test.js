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

			setStatus(400);

			const spans = element.shadowRoot.querySelectorAll('span');

			expect(spans).toHaveSize(1);
			expect(spans[0].innerText).toBe('routing_feedback_400');
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			const element = await setup();
			const spy = spyOn(element, '_unsubscribeFromStore').and.callThrough();
			element.onDisconnect(); // we call onDisconnect manually

			expect(spy).toHaveBeenCalled();
		});
	});
});
