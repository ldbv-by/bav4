import { AdminUI } from '../../../../src/modules/admin/components/AdminUI';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(AdminUI.tag, AdminUI);

describe('AdminUI', () => {
	const envServiceMock = {
		getWindow: () => {
			return window;
		}
	};

	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector.registerSingleton('EnvironmentService', envServiceMock);
		return TestUtils.render(AdminUI.tag);
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminUI();

			expect(element.getModel()).toEqual({});
		});

		it('has position fixed at root level', async () => {
			const element = await setup();
			const style = element.shadowRoot.querySelectorAll('style')[1];
			expect(style.innerText).toContain(':host { position: fixed; }');
		});
	});
});
