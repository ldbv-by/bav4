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
		store = TestUtils.setupStoreAndDi(initialState, { notifications: notificationReducer, modal: modalReducer, media: createNoInitialStateMediaReducer() });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

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

	});

	describe('when panel is rendered', () => {

		describe('the first time', () => {
			it('displays the username-input with focus', async () => {
				const element = await setup();
				const inputUsername = element.shadowRoot.querySelector('#credential_username');

				expect(element.shadowRoot.activeElement).toBe(inputUsername);
			});
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
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'foo', password: 'bar' }, 'someUrl').and.resolveTo(true);
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

		it('does NOT resolves credential with default authenticate-callback', async () => {
			const element = await setup();
			element.url = 'someUrl';
			element.signal('update_username', 'someUser');
			element.signal('update_password', '42');
			const authenticateSpy = spyOn(element, '_authenticate').and.callThrough();
			const onCloseSpy = spyOn(element, '_onClose').and.callThrough();
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');

			submitButton.click();
			await TestUtils.timeout();
			expect(authenticateSpy).toHaveBeenCalledWith({ username: 'someUser', password: '42' }, 'someUrl');
			expect(onCloseSpy).not.toHaveBeenCalled();
		});

		it('resolves credential on successful credential-check', async () => {
			const authenticateCallback = jasmine.createSpy().withArgs({ username: 'someUser', password: '42' }, 'someUrl').and.resolveTo({ foo: 'bar' });
			const onCloseCallback = () => { };
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
			const authenticateCallback = jasmine.createSpy().and.resolveTo(false);
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;

			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			submitButton.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('auth_passwordCredentialPanel_credential_rejected');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});

		it('displays spinner-button while authenticating', async () => {
			const authenticationDelay = 200;
			const authenticateCallback = async () => {
				await TestUtils.timeout(authenticationDelay);
				return true;
			};
			const onCloseCallback = () => { };
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
