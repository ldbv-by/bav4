import { $injector } from '../../../../src/injection';
import { PasswordCredentialPanel } from '../../../../src/modules/auth/components/PasswordCredentialPanel';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils';

window.customElements.define(PasswordCredentialPanel.tag, PasswordCredentialPanel);

describe('PasswordCredentialPanel', () => {
	let store;
	const setup = async (state = {}) => {
		const initialState = {
			notifications: {
				notification: null
			},
			media: {
				portrait: false
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			notifications: notificationReducer,
			modal: modalReducer,
			media: createNoInitialStateMediaReducer()
		});

		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(PasswordCredentialPanel.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new PasswordCredentialPanel().getModel();

			expect(model).toEqual({
				url: null,
				footer: null,
				credential: null,
				authenticating: false,
				showPassword: false,
				useForm: false
			});
		});

		it('has default callback methods', async () => {
			await setup();
			const instanceUnderTest = new PasswordCredentialPanel();

			expect(instanceUnderTest._authenticate).toBeDefined();
			await expectAsync(instanceUnderTest._authenticate()).toBeResolvedTo(false);

			expect(instanceUnderTest._onClose).toBeDefined();
		});
	});

	describe('when panel is rendered', () => {
		const fillCredentialFormElements = (element, username = null, password = null) => {
			const inputUsername = element.shadowRoot.querySelector('#credential_username');
			const inputPassword = element.shadowRoot.querySelector('#credential_password');
			const inputChangedEvent = new CustomEvent('input');

			if (username && inputUsername) {
				inputUsername.value = username;
				inputUsername.dispatchEvent(inputChangedEvent);
			}
			if (password && inputPassword) {
				inputPassword.value = password;
				inputPassword.dispatchEvent(inputChangedEvent);
			}
		};

		it('shows two properly configured input fields', async () => {
			const element = await setup();

			const inputUsername = element.shadowRoot.querySelector('#credential_username');
			const inputPassword = element.shadowRoot.querySelector('#credential_password');

			expect(inputUsername.hasAttribute('autofocus')).toBeTrue();
			expect(inputUsername.getAttribute('type')).toBe('text');

			expect(inputPassword.getAttribute('type')).toBe('password');
		});

		it('displays the optional url', async () => {
			const element = await setup();
			element.url = 'foo';

			expect(element.shadowRoot.querySelector('.credential_header').classList.contains('visible')).toBeTrue();
			expect(element.shadowRoot.querySelector('.title_url').textContent).toBe('auth_passwordCredentialPanel_title');
			expect(element.shadowRoot.querySelector('.value_url').textContent).toBe('foo');
			expect(element.shadowRoot.querySelector('.value_url').title).toBe('foo');
		});

		it('hides optional but empty url', async () => {
			const element = await setup();

			expect(element.url).toBeNull();

			expect(element.shadowRoot.querySelector('.credential_header').classList.contains('visible')).toBeFalse();
			expect(element.shadowRoot.querySelector('.credential_header').textContent).toBe('');
			expect(element.shadowRoot.querySelector('.title_url')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.value_url')).toBeFalsy();
		});

		it('displays the optional footer', async () => {
			const element = await setup();
			element.footer = 'foo footer';

			expect(element.shadowRoot.querySelector('.credential_custom_content').classList.contains('visible')).toBeTrue();
			expect(element.shadowRoot.querySelector('.credential_custom_content').textContent).toBe('foo footer');
		});

		it('hides optional but empty footer', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.credential_custom_content').classList.contains('visible')).toBeFalse();
			expect(element.shadowRoot.querySelector('.credential_custom_content').textContent).toBe('');
		});

		it('receives entered username and password', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.resolveTo({ foo: 'bar' });
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			const inputUsername = element.shadowRoot.querySelector('#credential_username');
			const inputPassword = element.shadowRoot.querySelector('#credential_password');
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');

			inputUsername.value = 'foo';
			inputUsername.dispatchEvent(new Event('input'));
			inputPassword.value = 'bar';
			inputPassword.dispatchEvent(new Event('input'));
			submitButton.click();

			expect(authenticateCallback).toHaveBeenCalled();
		});

		it('calls authenticate-callback after Enter-key is pressed on input-element', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.resolveTo(null);
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;

			fillCredentialFormElements(element, 'foo', 'bar');
			const inputUsername = element.shadowRoot.querySelector('#credential_username');
			const inputPassword = element.shadowRoot.querySelector('#credential_password');

			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
			inputPassword.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

			expect(authenticateCallback).toHaveBeenCalledTimes(2);
		});

		it('does NOT call authenticate-callback after username input fails validation', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.callThrough();
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			fillCredentialFormElements(element, null, 'bar');

			submitButton.click();

			expect(authenticateCallback).not.toHaveBeenCalled();
		});

		it('does NOT call authenticate-callback after password input fails validation', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.callThrough();
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			fillCredentialFormElements(element, 'foo', null);

			submitButton.click();

			expect(authenticateCallback).not.toHaveBeenCalled();
		});

		it('does NOT call authenticate-callback after other than Enter-key is pressed on input-element', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.callThrough();
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			const inputUsername = element.shadowRoot.querySelector('#credential_username');

			element.signal('update_username', 'foo');
			element.signal('update_password', 'bar');

			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'F11' }));
			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'Some' }));

			expect(authenticateCallback).not.toHaveBeenCalled();
		});

		it('does NOT resolve credential with default authenticate-callback', async () => {
			const element = await setup();
			element.url = 'someUrl';
			const authenticateSpy = spyOn(element, '_authenticate').and.resolveTo(null);
			const onCloseSpy = spyOn(element, '_onClose').and.callThrough();
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			fillCredentialFormElements(element, 'someUser', '42');

			submitButton.click();
			await TestUtils.timeout();
			expect(authenticateSpy).toHaveBeenCalledWith({ username: 'someUser', password: '42' }, 'someUrl');
			expect(onCloseSpy).not.toHaveBeenCalled();
		});

		it('resolves credential on successful credential-check', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'someUser', password: '42' }, 'someUrl').and.resolveTo({ foo: 'bar' });
			const onCloseCallback = () => {};
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			element.onClose = onCloseCallback;
			fillCredentialFormElements(element, 'someUser', '42');
			const spy = spyOn(element, '_onClose').and.callThrough();
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');

			submitButton.click();
			await TestUtils.timeout();
			expect(authenticateCallback).toHaveBeenCalled();
			expect(spy).toHaveBeenCalledWith({ username: 'someUser', password: '42' }, { foo: 'bar' });
		});

		it('emits notification on failed credential-authentication', async () => {
			const authenticateCallback = jasmine.createSpy().and.resolveTo(null);
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			fillCredentialFormElements(element, 'foo', 'bar');
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			submitButton.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('auth_passwordCredentialPanel_credential_failed');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});

		it('emits notification on rejected credential-authentication', async () => {
			const authenticateCallback = jasmine.createSpy().and.rejectWith('fail');
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			const errorSpy = spyOn(console, 'error');
			fillCredentialFormElements(element, 'foo', 'bar');
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			submitButton.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('auth_passwordCredentialPanel_credential_rejected');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			expect(errorSpy).toHaveBeenCalledOnceWith('fail');
		});

		it('displays spinner-button while authenticating', async () => {
			const authenticationDelay = 200;
			const authenticateCallback = async () => {
				await TestUtils.timeout(authenticationDelay);
				return true;
			};
			const onCloseCallback = () => {};
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			element.onClose = onCloseCallback;
			fillCredentialFormElements(element, 'foo', 'bar');

			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			submitButton.click();

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('#authenticating-button')).toHaveSize(1);
			await TestUtils.timeout(authenticationDelay);
			expect(element.shadowRoot.querySelectorAll('#authenticate-credential-button')).toHaveSize(1);
		});

		it('toggles the visibility of password-characters', async () => {
			const element = await setup();
			const inputPassword = element.shadowRoot.querySelector('#credential_password');
			const togglePassword = element.shadowRoot.querySelector('#toggle_password');
			expect(togglePassword).toHaveClass('password-icon');

			expect(inputPassword.getAttribute('type')).toBe('password');
			expect(togglePassword).toHaveClass('eyeslash');
			expect(togglePassword).not.toHaveClass('eye');
			togglePassword.click();
			expect(inputPassword.getAttribute('type')).toBe('text');
			expect(togglePassword).toHaveClass('eye');
			expect(togglePassword).not.toHaveClass('eyeslash');
			togglePassword.click();
			expect(inputPassword.getAttribute('type')).toBe('password');
			expect(togglePassword).toHaveClass('eyeslash');
			expect(togglePassword).not.toHaveClass('eye');
		});

		it('all "ba-form-element" elements receive the "userVisited" class', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.callThrough();
			const element = await setup();
			const allBaFormElements = element.shadowRoot.querySelectorAll('.ba-form-element');
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			fillCredentialFormElements(element, null, null);

			submitButton.click();

			expect(allBaFormElements).toHaveSize(2);
			allBaFormElements.forEach((element) => {
				expect(element.classList.contains(BA_FORM_ELEMENT_VISITED_CLASS)).toBeTrue();
			});
		});
	});

	describe('properties', () => {
		it('provides default properties', async () => {
			await setup();
			const passwordCredentialPanel = new PasswordCredentialPanel();

			expect(passwordCredentialPanel.url).toBeNull();
			expect(passwordCredentialPanel.useForm).toBeFalse();
		});

		it('provides set methods and getters', async () => {
			await setup();
			const passwordCredentialPanel = new PasswordCredentialPanel();

			passwordCredentialPanel.url = 'someUrl';
			passwordCredentialPanel.useForm = true;

			expect(passwordCredentialPanel.url).toBe('someUrl');
			expect(passwordCredentialPanel.useForm).toBeTrue();
		});
	});

	describe('when property `useForm` changes', () => {
		it('changes the tag of the form', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.credential_form').tagName).toBe('DIV');

			element.useForm = true;

			expect(element.shadowRoot.querySelector('.credential_form').tagName).toBe('FORM');
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape desktop', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
		});

		it('layouts for portrait desktop', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
		});
	});
});
