import { $injector } from '../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { ProposalContextContent } from '../../../../src/modules/routing/components/contextMenu/ProposalContextContent';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';
import { MvuElement } from '../../../../src/modules/MvuElement';

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
});
