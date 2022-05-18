import { $injector } from '../../../../src/injection';
import { BaaCredentialPanel } from '../../../../src/modules/auth/components/BaaCredentialPanel';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(BaaCredentialPanel.tag, BaaCredentialPanel);

describe('BaaCredentialPanel', () => {
	let store;
	const setup = async (state = {}) => {
		const initialState = {
			notifications: {
				notification: null
			},
			media: {
				portrait: false
			},
			modal: {
				data: null
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, { notifications: notificationReducer, modal: modalReducer, media: createNoInitialStateMediaReducer() });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(BaaCredentialPanel.tag);
	};

	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new BaaCredentialPanel().getModel();

			expect(model).toEqual({
				url: null,
				credential: null,
				authenticating: false
			});
		});

	});

	describe('when panel is rendered', () => {

		it('displays the url', async () => {
			const element = await setup();
			element.url = 'foo';

			expect(element.shadowRoot.querySelector('.title_url').textContent).toBe('auth_baaCredentialPanel_title');
			expect(element.shadowRoot.querySelector('.value_url').textContent).toBe('foo');
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

		it('resolves credential on successfull credential-check', async () => {
			const authenticateCallback = jasmine.createSpy().and.resolveTo(true);
			const onCloseCallback = () => { };
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;
			element.onClose = onCloseCallback;

			const spy = spyOn(element, '_onClose').and.callThrough();
			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');

			submitButton.click();
			await TestUtils.timeout();
			expect(authenticateCallback).toHaveBeenCalled();
			expect(spy).toHaveBeenCalledWith(null);
		});


		it('emits notification on failed credential-authentication', async () => {
			const authenticateCallback = jasmine.createSpy().and.resolveTo(false);
			const element = await setup();
			element.url = 'someUrl';
			element.authenticate = authenticateCallback;

			const submitButton = element.shadowRoot.querySelector('#authenticate-credential-button');
			submitButton.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('auth_baaCredentialPanel_credential_rejected');
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
			expect(element.shadowRoot.querySelector('#authenticating-button')).toBeTruthy();
			await TestUtils.timeout(authenticationDelay);
			expect(element.shadowRoot.querySelector('#authenticate-credential-button')).toBeTruthy();
		});
	});

	describe('properties', () => {
		it('provides default properties', async () => {
			await setup();
			const baaCredentialPanel = new BaaCredentialPanel();

			expect(baaCredentialPanel.url).toBeNull();
		});

		it('provides set methods and getters', async () => {
			await setup();
			const baaCredentialPanel = new BaaCredentialPanel();

			baaCredentialPanel.url = 'someUrl';

			expect(baaCredentialPanel.url).toBe('someUrl');
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
