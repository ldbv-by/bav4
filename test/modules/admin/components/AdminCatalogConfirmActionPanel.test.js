import { AdminCatalogConfirmActionPanel } from '../../../../src/modules/admin/components/AdminCatalogConfirmActionPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(AdminCatalogConfirmActionPanel.tag, AdminCatalogConfirmActionPanel);

describe('AdminCatalogConfirmActionPanel', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(AdminCatalogConfirmActionPanel.tag);
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminCatalogConfirmActionPanel();
			expect(element.getModel()).toEqual({});
		});
	});

	describe('when ui renders', () => {
		it('renders confirm button', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('#confirm-button');

			expect(button).not.toBeNull();
			expect(button.label).toEqual('admin_modal_button_confirm');
		});

		it('submits with custom callback', async () => {
			const element = await setup();
			const spy = jasmine.createSpy();
			element.onSubmit = spy;
			element.shadowRoot.querySelector('#confirm-button').click();
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('submits with default callback', async () => {
			const element = await setup();
			const spy = spyOn(element, '_onSubmit').and.callThrough();
			element.shadowRoot.querySelector('#confirm-button').click();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});
});
