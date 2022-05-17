import { $injector } from '../../../../src/injection';
import { BaaCredentialPanel } from '../../../../src/modules/auth/components/BaaCredentialPanel';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { closeModal, openModal } from '../../../../src/store/modal/modal.action';
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
				id: null,
				credential: { username: null, password: null },
				checkIsRunning: false,
				subscription: null
			});
		});

	});

	describe('when panel is rendered', () => {

		it('displays the id', async () => {
			const element = await setup();
			element.id = 'foo';

			expect(element.shadowRoot.querySelector('.title_id').textContent).toBe('auth_baaCredentialPanel_title');
			expect(element.shadowRoot.querySelector('.value_id').textContent).toBe('foo');
		});

		it('receives entered username and password', async () => {
			const checkCallback = jasmine.createSpy().withArgs('someId', { username: 'foo', password: 'bar' }).and.resolveTo(true);
			const element = await setup();
			element.id = 'someId';
			element.onCheck = checkCallback;
			const inputUsername = element.shadowRoot.querySelector('#credential_username');
			const inputPassword = element.shadowRoot.querySelector('#credential_password');
			const submitButton = element.shadowRoot.querySelector('#check-credential-button');

			inputUsername.value = 'foo';
			inputUsername.dispatchEvent(new Event('input'));
			inputPassword.value = 'bar';
			inputPassword.dispatchEvent(new Event('input'));
			submitButton.click();

			expect(checkCallback).toHaveBeenCalled();
		});

		it('resolves credential on successfull credential-check', async () => {
			const checkCallback = jasmine.createSpy().and.resolveTo(true);
			const resolveCallback = () => { };
			const element = await setup();
			element.id = 'someId';
			element.onCheck = checkCallback;
			element.onResolved = resolveCallback;

			const spy = spyOn(element, 'onResolved').and.callThrough();
			const submitButton = element.shadowRoot.querySelector('#check-credential-button');

			submitButton.click();
			await TestUtils.timeout();
			expect(checkCallback).toHaveBeenCalled();
			expect(spy).toHaveBeenCalledWith({ username: null, password: null });
		});


		it('emits notification on failed credential-check', async () => {
			const checkCallback = jasmine.createSpy().and.resolveTo(false);
			const element = await setup();
			element.id = 'someId';
			element.onCheck = checkCallback;

			const submitButton = element.shadowRoot.querySelector('#check-credential-button');

			submitButton.click();
			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('auth_baaCredentialPanel_credential_rejected');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});

		it('calls resolve-callback after closing modal', async () => {
			const resolveCallback = () => { };
			const element = await setup();
			element.id = 'someId';
			element.onResolved = resolveCallback;

			const spy = spyOn(element, 'onResolved').and.callThrough();

			closeModal();
			await TestUtils.timeout();
			expect(spy).toHaveBeenCalledWith(null);
		});

		it('calls not resolve-callback after open modal', async () => {
			const resolveCallback = () => { };
			const element = await setup();
			element.id = 'someId';
			element.onResolved = resolveCallback;

			const spy = spyOn(element, 'onResolved').and.callThrough();

			openModal('', 'some');
			await TestUtils.timeout();
			expect(spy).not.toHaveBeenCalled();
		});

		it('displays spinner-button while check is running', async () => {
			const checkDelay = 200;
			const checkCallback = async () => {
				await TestUtils.timeout(checkDelay);
				return true;
			};
			const resolveCallback = () => { };
			const element = await setup();
			element.id = 'someId';
			element.onCheck = checkCallback;
			element.onResolved = resolveCallback;


			const submitButton = element.shadowRoot.querySelector('#check-credential-button');
			submitButton.click();
			await TestUtils.timeout();
			expect(element.shadowRoot.querySelector('#check-spinner-button')).toBeTruthy();
			await TestUtils.timeout(checkDelay);
			expect(element.shadowRoot.querySelector('#check-credential-button')).toBeTruthy();
		});
	});

	describe('properties', () => {
		it('provides default properties', async () => {
			await setup();
			const baaCredentialPanel = new BaaCredentialPanel();

			expect(baaCredentialPanel.id).toBeNull();
		});

		it('provides set methods and getters', async () => {
			await setup();
			const baaCredentialPanel = new BaaCredentialPanel();

			baaCredentialPanel.id = 'someId';

			expect(baaCredentialPanel.id).toBe('someId');
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
