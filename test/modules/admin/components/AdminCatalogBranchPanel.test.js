import { AdminCatalogBranchPanel } from '../../../../src/modules/admin/components/AdminCatalogBranchPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../src/utils/markup';

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
			expect(input.hasAttribute('required')).toBeTrue();
			expect(element.shadowRoot.querySelector('[for="branch-input"]').textContent).toEqual('admin_modal_branch_label');
			expect(input.parentNode.querySelector('.error-label').textContent).toEqual('admin_required_field_error');
		});

		it('renders confirm button', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('#confirm-button');

			expect(button).not.toBeNull();
			expect(button.label).toEqual('admin_modal_button_confirm');
		});
	});

	describe('user actions', () => {
		it('marks inputs as visited', async () => {
			const element = await setup();
			const input = element.shadowRoot.querySelector('#branch-input');

			input.dispatchEvent(new Event('input'));

			expect(input.parentElement.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS));
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

		it('refuses to submit when branch-input is invalid', async () => {
			const spy = jasmine.createSpy();
			const element = await setup();
			const input = element.shadowRoot.querySelector('#branch-input');

			element.onSubmit = spy;
			input.value = '';
			element.shadowRoot.querySelector('#confirm-button').click();

			expect(spy).toHaveBeenCalledTimes(0);
			expect(input.parentElement.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS));
		});

		it('submits with default callback', async () => {
			const element = await setup();
			element.shadowRoot.querySelector('#branch-input').value = 'some value';
			const spy = spyOn(element, '_onSubmit').and.callThrough();
			element.shadowRoot.querySelector('#confirm-button').click();
			expect(spy).toHaveBeenCalled();
		});
	});
});
