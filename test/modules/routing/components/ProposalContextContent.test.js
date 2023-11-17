import { $injector } from '../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { ProposalContextContent } from '../../../../src/modules/routing/components/contextMenu/ProposalContextContent';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { EventLike } from '../../../../src/utils/storeUtils';
import { setProposal } from '../../../../src/store/routing/routing.action';
import { CoordinateProposalType } from '../../../../src/domain/routing';

window.customElements.define(ProposalContextContent.tag, ProposalContextContent);

describe('ProposalContextContent', () => {
	const setup = (state) => {
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
		return TestUtils.render(ProposalContextContent.tag);
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
			const model = new ProposalContextContent().getModel();

			expect(model).toEqual({
				proposal: null,
				preventClose: false
			});
		});
	});

	describe('when initialized', () => {
		it('observes store.routing.proposal s-o-s', async () => {
			const element = await setup();
			const spy = spyOn(element, 'signal').withArgs('update_proposal', jasmine.any(EventLike)).and.callThrough();

			setProposal([0, 0], CoordinateProposalType.START);

			expect(spy).toHaveBeenCalled();
		});

		it('renders action-buttons based on store.routing.proposal s-o-s', async () => {
			const element = await setup({
				routing: { proposal: new EventLike({ coordinate: [42, 21], type: CoordinateProposalType.START_OR_DESTINATION }) }
			});

			const buttons = element.shadowRoot.querySelectorAll('button');
			expect(buttons).toHaveSize(2);
			expect(buttons[0].id).toBe('start');
			expect(buttons[1].id).toBe('destination');
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
