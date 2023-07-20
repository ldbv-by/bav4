import { $injector } from '../../../../src/injection';
import { PasswordCredentialPanel } from '../../../../src/modules/auth/components/PasswordCredentialPanel';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
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
				credential: null,
				authenticating: false,
				showPassword: false
			});
		});

		it('has default callback methods', async () => {
			await setup();
			const instanceUnderTest = new PasswordCredentialPanel();

			expect(instanceUnderTest._authenticate).toBeDefined();
			expect(instanceUnderTest._authenticate()).toBeFalse();

			expect(instanceUnderTest._onClose).toBeDefined();
		});
	});

	describe('when panel is rendered', () => {
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

			expect(element.shadowRoot.querySelector('.title_url').textContent).toBe('auth_passwordCredentialPanel_title');
			expect(element.shadowRoot.querySelector('.value_url').textContent).toBe('foo');
			expect(element.shadowRoot.querySelector('.value_url').title).toBe('foo');
		});

		it('hides optimal but empty url', async () => {
			const element = await setup();

			expect(element.url).toBeNull();

			expect(element.shadowRoot.querySelector('.title_url')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.value_url')).toBeFalsy();
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
			const inputUsername = element.shadowRoot.querySelector('#credential_username');
			const inputPassword = element.shadowRoot.querySelector('#credential_password');

			element.signal('update_username', 'foo');
			element.signal('update_password', 'bar');

			inputUsername.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
			inputPassword.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

			expect(authenticateCallback).toHaveBeenCalledTimes(2);
		});

		it('does NOT calls authenticate-callback after other than Enter-key is pressed on input-element', async () => {
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

		it('does NOT resolves credential with default authenticate-callback', async () => {
			const element = await setup();
			element.url = 'someUrl';
			element.signal('update_username', 'someUser');
			element.signal('update_password', '42');
			const authenticateSpy = spyOn(element, '_authenticate').and.resolveTo(null);
			const onCloseSpy = spyOn(element, '_onClose').and.callThrough();
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');

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
			element.signal('update_username', 'someUser');
			element.signal('update_password', '42');
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

			expect(inputPassword.getAttribute('type')).toBe('password');
			expect(togglePassword).toHaveClass('eye-slash');
			expect(togglePassword).not.toHaveClass('eye');
			togglePassword.click();
			expect(inputPassword.getAttribute('type')).toBe('text');
			expect(togglePassword).toHaveClass('eye-slash');
			expect(togglePassword).toHaveClass('eye');
			togglePassword.click();
			expect(inputPassword.getAttribute('type')).toBe('password');
			expect(togglePassword).toHaveClass('eye-slash');
			expect(togglePassword).not.toHaveClass('eye');
		});
	});

	describe('properties', () => {
		it('provides default properties', async () => {
			await setup();
			const passwordCredentialPanel = new PasswordCredentialPanel();

			expect(passwordCredentialPanel.url).toBeNull();
		});

		it('provides set methods and getters', async () => {
			await setup();
			const passwordCredentialPanel = new PasswordCredentialPanel();

			passwordCredentialPanel.url = 'someUrl';

			expect(passwordCredentialPanel.url).toBe('someUrl');
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
