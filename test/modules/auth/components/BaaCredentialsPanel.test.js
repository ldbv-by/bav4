import { $injector } from '../../../../src/injection';
import { BaaCredentialsPanel } from '../../../../src/modules/auth/components/BaaCredentialsPanel';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(BaaCredentialsPanel.tag, BaaCredentialsPanel);

describe('BaaCredentialsPanel', () => {

	const setup = async (state = {}) => {
		const initialState = {
			media: {
				portrait: false,
				minWidth: true
			},
			modal: {
				data: null
			},
			...state
		};
		TestUtils.setupStoreAndDi(initialState, { modal: modalReducer, media: createNoInitialStateMediaReducer() });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(BaaCredentialsPanel.tag);
	};

	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new BaaCredentialsPanel().getModel();

			expect(model).toEqual({
				id: null,
				credentials: { username: null, password: null }
			});
		});
	});
});
