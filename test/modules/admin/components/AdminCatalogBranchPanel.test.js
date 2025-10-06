import { AdminCatalogBranchPanel } from '../../../../src/modules/admin/components/AdminCatalogBranchPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(AdminCatalogBranchPanel.tag, AdminCatalogBranchPanel);

describe('AdminCatalogBranchPanel', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(AdminCatalogBranchPanel.tag);
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminCatalogBranchPanel();
			expect(element.getModel()).toEqual({});
		});

		it('has properties with default values', async () => {
			await setup();
			const element = new AdminCatalogBranchPanel();
			expect(element._onSubmit).toBeDefined();
			expect(element._id).toBe('');
			expect(element._label).toBe('');
		});
	});

	describe('when ui renders', () => {
		it('renders branch input', async () => {
			const element = await setup();
			const input = element.shadowRoot.querySelector('#branch-input');
			expect(input).not.toBeNull();
			expect(element.shadowRoot.querySelector('[for="branch-input"]').textContent).toEqual('admin_modal_branch_label');
			expect(input.parentNode.querySelector('.error-label').textContent).toEqual('admin_required_field_error');
		});

		it('renders confirm button', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('#confirm-button');

			expect(button).not.toBeNull();
			expect(button.label).toEqual('admin_modal_button_confirm');
		});

		it('sends the label on submit', async () => {
			const element = await setup();
			const input = element.shadowRoot.querySelector('#branch-input');
			const spy = jasmine.createSpy();
			element.onSubmit = spy;
			element.id = 'id-foo';
			element.label = 'init label';

			input.value = 'foo';
			input.dispatchEvent(new Event('input'));
			element.shadowRoot.querySelector('#confirm-button').click();

			expect(spy).toHaveBeenCalledOnceWith('id-foo', 'foo');
		});

		it('submits with default callback', async () => {
			const element = await setup();
			const spy = spyOn(element, '_onSubmit').and.callThrough();
			element.shadowRoot.querySelector('#confirm-button').click();
			expect(spy).toHaveBeenCalled();
		});
	});
});
