import { html } from 'lit-html';
import { $injector } from '../../../../src/injection';
import { AdminUI } from '../../../../src/modules/admin/components/AdminUI';
import { TestUtils } from '../../../test-utils';
window.customElements.define(AdminUI.tag, AdminUI);

describe('AdminUI', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector.registerSingleton('TranslationService', { translate: (key, params) => html`${key}${params[0] ?? ''}` });
		return TestUtils.render(AdminUI.tag);
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminUI();

			expect(element.getModel()).toEqual({});
		});
	});
});
