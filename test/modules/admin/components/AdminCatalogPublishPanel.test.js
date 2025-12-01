import { AdminCatalogPublishPanel } from '../../../../src/modules/admin/components/AdminCatalogPublishPanel';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { Environment } from '../../../../src/modules/admin/services/AdminCatalogService';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../src/utils/markup';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';

window.customElements.define(AdminCatalogPublishPanel.tag, AdminCatalogPublishPanel);

describe('AdminCatalogPublishPanel', () => {
	let store;

	const adminCatalogServiceMock = {
		publishCatalog: async () => {}
	};

	const translationServiceMock = {
		translate: (key, params = []) => {
			return params.length > 0 ? `${key}.${params.join('.')}` : key;
		}
	};

	const setup = async (properties = {}) => {
		store = TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', translationServiceMock).registerSingleton('AdminCatalogService', adminCatalogServiceMock);
		return TestUtils.render(AdminCatalogPublishPanel.tag, properties);
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminCatalogPublishPanel();
			expect(element.getModel()).toEqual({ environment: Environment.STAGE });
		});

		it('has members with default values', async () => {
			await setup();
			const element = new AdminCatalogPublishPanel();
			expect(element._onSubmit).toBeDefined();
			expect(element._editor).toBe('');
			expect(element._publishMessage).toBe('');
			expect(element._warningHint).toBe(null);
		});
	});

	describe('when ui renders', () => {
		describe('default', () => {
			it('renders environment-select', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');
				const label = element.shadowRoot.querySelector('[for="environment-select"]');

				expect(select).not.toBeNull();
				expect(select.options[select.selectedIndex].textContent).toEqual('admin_environment_stage');
				expect(label.textContent).toEqual('admin_environment');
			});

			it('renders confirm button', async () => {
				const element = await setup();
				const button = element.shadowRoot.querySelector('#confirm-button');

				expect(button).not.toBeNull();
				expect(button.label).toEqual('admin_modal_button_publish');
			});

			it('renders a warning container', async () => {
				const element = await setup({ warningHint: 'a warning hint' });
				expect(element.shadowRoot.querySelector('.warning-container span:nth-child(2)').textContent).toEqual('a warning hint');
			});

			it('does not render editor-input', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#editor-input')).toBeNull();
			});

			it('does not render publish-message-input', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#publish-message-input')).toBeNull();
			});

			it('does not renders an empty warning container', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('.warning-container')).toBeNull();
			});
		});

		describe('with environment set to production', () => {
			it('renders editor-input', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');

				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				const input = element.shadowRoot.querySelector('#editor-input');

				expect(input).not.toBeNull();
				expect(input.hasAttribute('required')).toBeTrue();
				expect(input.placeholder).toEqual('admin_modal_publish_editor');
				expect(element.shadowRoot.querySelector('[for="editor-input"]').textContent).toEqual('admin_modal_publish_editor');
				expect(input.parentNode.querySelector('.error-label').textContent).toEqual('admin_required_field_error');
			});

			it('renders publish-message-input', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');

				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				const input = element.shadowRoot.querySelector('#publish-message-input');

				expect(input).not.toBeNull();
				expect(input.hasAttribute('required')).toBeTrue();
				expect(input.placeholder).toEqual('admin_modal_publish_message');
				expect(element.shadowRoot.querySelector('[for="publish-message-input"]').textContent).toEqual('admin_modal_publish_message');
				expect(input.parentNode.querySelector('.error-label').textContent).toEqual('admin_required_field_error');
			});
		});

		describe('user actions', () => {
			it('changes the model on select change', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');

				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				expect(select.options[select.selectedIndex].textContent).toBe('admin_environment_production');
				expect(element.getModel().environment).toEqual(Environment.PRODUCTION);
			});

			it('changes the internal member _editor on input', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				const input = element.shadowRoot.querySelector('#editor-input');
				input.value = 'foo';
				input.dispatchEvent(new Event('input'));

				expect(element._editor).toEqual('foo');
			});

			it('changes the internal member _publishMessage on input', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				const input = element.shadowRoot.querySelector('#publish-message-input');
				input.value = 'foo';
				input.dispatchEvent(new Event('input'));

				expect(element._publishMessage).toEqual('foo');
			});

			it('marks inputs as visited', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				const editorInput = element.shadowRoot.querySelector('#editor-input');
				const publishMessageInput = element.shadowRoot.querySelector('#publish-message-input');
				editorInput.dispatchEvent(new Event('input'));
				publishMessageInput.dispatchEvent(new Event('input'));

				expect(editorInput.parentElement.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS));
				expect(publishMessageInput.parentElement.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS));
			});

			it('marks inputs as visited on confirm', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				const editorInput = element.shadowRoot.querySelector('#editor-input');
				const publishMessageInput = element.shadowRoot.querySelector('#publish-message-input');
				const button = element.shadowRoot.querySelector('#confirm-button');
				button.click();

				expect(editorInput.parentElement.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS));
				expect(publishMessageInput.parentElement.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS));
			});

			it('publishes the tree on production', async () => {
				const submitSpy = jasmine.createSpy();
				const publishSpy = spyOn(adminCatalogServiceMock, 'publishCatalog').and.resolveTo();
				const element = await setup();
				element.onSubmit = submitSpy;
				element.topicId = 'foo';
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));
				element.shadowRoot.querySelector('#editor-input').value = 'maxwell muster';
				element.shadowRoot.querySelector('#publish-message-input').value = 'bar';

				element.shadowRoot.querySelector('#confirm-button').click();

				await TestUtils.timeout(); // wait for store to update
				expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_published_notification.admin_environment_production');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				expect(submitSpy).toHaveBeenCalledTimes(1);
				expect(publishSpy).toHaveBeenCalledWith(Environment.PRODUCTION, 'foo', { editor: 'maxwell muster', message: 'bar' });
			});

			it('publishes on test environment', async () => {
				const publishSpy = spyOn(adminCatalogServiceMock, 'publishCatalog').and.resolveTo();
				const element = await setup();
				element.topicId = 'foo';

				element.shadowRoot.querySelector('#confirm-button').click();

				await TestUtils.timeout(); // wait for store to update
				expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_published_notification.admin_environment_stage');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				expect(publishSpy).toHaveBeenCalledWith(Environment.STAGE, 'foo', {});
			});

			it('refuses to publish when editor-input is invalid', async () => {
				const spy = jasmine.createSpy();
				const element = await setup();
				element.onSubmit = spy;
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				element.shadowRoot.querySelector('#publish-message-input').value = 'foo';
				element.shadowRoot.querySelector('#confirm-button').click();

				expect(spy).toHaveBeenCalledTimes(0);
			});

			it('refuses to publish when publish-message-input is invalid', async () => {
				const spy = jasmine.createSpy();
				const element = await setup();
				element.onSubmit = spy;
				const select = element.shadowRoot.querySelector('#environment-select');
				select.value = Environment.PRODUCTION;
				select.dispatchEvent(new Event('change'));

				element.shadowRoot.querySelector('#editor-input').value = 'foo';
				element.shadowRoot.querySelector('#confirm-button').click();

				expect(spy).toHaveBeenCalledTimes(0);
			});
		});

		describe('error handling', () => {
			it('notifies when publishing fails', async () => {
				spyOn(adminCatalogServiceMock, 'publishCatalog').and.rejectWith('foo');
				const element = await setup();

				element.shadowRoot.querySelector('#confirm-button').click();
				await TestUtils.timeout(); // wait for store to update

				expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_publish_failed_notification');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			});
		});
	});
});
