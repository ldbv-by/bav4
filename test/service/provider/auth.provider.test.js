import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/domain/mediaTypes';
import {
	bvvSignInProvider,
	bvvAuthResponseInterceptorProvider,
	bvvSignOutProvider,
	bvvHttpServiceIgnore401PathProvider,
	BvvCredentialPanelIntervalMs,
	bvvInitialAuthStatusProvider
} from '../../../src/services/provider/auth.provider';
import { TestUtils } from '../../test-utils';
import { modalReducer } from '../../../src/store/modal/modal.reducer';
import { PasswordCredentialPanel } from '../../../src/modules/auth/components/PasswordCredentialPanel';
import { BvvPlusPasswordCredentialFooter } from '../../../src/modules/auth/components/BvvPlusPasswordCredentialFooter';
import { Badge } from '../../../src/modules/commons/components/badge/Badge';
import { closeModal } from '../../../src/store/modal/modal.action';
import { BvvRoles } from '../../../src/domain/roles';
import { createUniqueId } from '../../../src/utils/numberUtils';
import { notificationReducer } from '../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../src/store/notifications/notifications.action';

describe('bvvSignInProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		post: async () => {}
	};

	let store;
	beforeEach(() => {
		const initialState = {
			modal: {
				active: false
			}
		};
		store = TestUtils.setupStoreAndDi(initialState, { modal: modalReducer });
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('TranslationService', { translate: (key) => key });
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('no credentials present', () => {
		it('opens an authentication UI for requested roles', async () => {
			const responsePromise = bvvSignInProvider();
			await TestUtils.timeout(); /**promise queue execution */

			expect(store.getState().modal.active).toBeTrue();
			const wrapperElementTitle = TestUtils.renderTemplateResult(store.getState().modal.data.title);
			expect(wrapperElementTitle.innerHTML).toContain('global_import_authenticationModal_title&nbsp');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)).toHaveSize(1);
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].label).toBe('Plus');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].size).toBe('1.5');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].color).toBe('var(--text3)');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].background).toBe('var(--primary-color)');
			const wrapperElementContent = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElementContent.querySelectorAll(PasswordCredentialPanel.tag)).toHaveSize(1);
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(jasmine.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(jasmine.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).useForm).toBeTrue();
			const wrapperElementFooter = TestUtils.renderTemplateResult(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).footer);
			expect(wrapperElementFooter.querySelectorAll(BvvPlusPasswordCredentialFooter.tag)).toHaveSize(1);
			closeModal(); /** we close the modal in order to resolve the promise */
			await expectAsync(responsePromise).toBeResolved();
		});

		describe('call of the authenticate callback', () => {
			describe('credentials are valid', () => {
				it('resolves with the correct role', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const roles = ['test'];
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = spyOn(httpService, 'post')
						.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
						.and.resolveTo(new Response(JSON.stringify(roles)));
					const responsePromise = bvvSignInProvider();
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;

					await expectAsync(authFunc(credential)).toBeResolvedTo(roles);
					closeModal(); /** we close the modal in order to resolve the promise */
					await expectAsync(responsePromise).toBeResolved();
					expect(configServiceSpy).toHaveBeenCalled();
					expect(httpServiceSpy).toHaveBeenCalled();
				});
			});

			describe('credentials are not valid', () => {
				it('resolves to false', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = spyOn(httpService, 'post')
						.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
						.and.resolveTo(new Response(null, { status: 400 }));
					const responsePromise = bvvSignInProvider();
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;

					await expectAsync(authFunc(credential)).toBeResolvedTo(false);
					closeModal(); /** we close the modal in order to resolve the promise */
					await expectAsync(responsePromise).toBeResolved();
					expect(configServiceSpy).toHaveBeenCalled();
					expect(httpServiceSpy).toHaveBeenCalled();
				});
			});

			describe('backend returns any other status code', () => {
				it('throws an error', async () => {
					const statusCode = 500;
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = spyOn(httpService, 'post')
						.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
						.and.resolveTo(new Response(null, { status: statusCode }));
					const responsePromise = bvvSignInProvider();
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;

					await expectAsync(authFunc(credential)).toBeRejectedWithError(`Sign in not possible: Http-Status ${statusCode}`);
					closeModal(); /** we close the modal in order to resolve the promise */
					await expectAsync(responsePromise).toBeResolved();
					expect(configServiceSpy).toHaveBeenCalled();
					expect(httpServiceSpy).toHaveBeenCalled();
				});
			});
		});

		describe('credentials are present', () => {
			describe('credentials are valid', () => {
				it('resolves with the correct role', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const roles = ['test'];
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = spyOn(httpService, 'post')
						.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
						.and.resolveTo(new Response(JSON.stringify(roles)));

					await expectAsync(bvvSignInProvider(credential)).toBeResolvedTo(roles);
					expect(configServiceSpy).toHaveBeenCalled();
					expect(httpServiceSpy).toHaveBeenCalled();
				});
			});

			describe('credentials are not valid', () => {
				it('resolves to false', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = spyOn(httpService, 'post')
						.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
						.and.resolveTo(new Response(null, { status: 400 }));

					await expectAsync(bvvSignInProvider(credential)).toBeResolvedTo(false);
					expect(configServiceSpy).toHaveBeenCalled();
					expect(httpServiceSpy).toHaveBeenCalled();
				});
			});

			describe('backend returns any other status code', () => {
				it('throws an error', async () => {
					const statusCode = 500;
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = spyOn(httpService, 'post')
						.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
						.and.resolveTo(new Response(null, { status: statusCode }));

					await expectAsync(bvvSignInProvider(credential)).toBeRejectedWithError(`Sign in not possible: Http-Status ${statusCode}`);
					expect(configServiceSpy).toHaveBeenCalled();
					expect(httpServiceSpy).toHaveBeenCalled();
				});
			});
		});
	});

	describe('call of the onClose callback', () => {
		describe('after successful authentication', () => {
			it('closes the modal and resolves with the retry response', async () => {
				const roles = ['test'];
				const credential = { username: 'u', password: 'p' };
				const responsePromise = bvvSignInProvider();
				await TestUtils.timeout(); /**promise queue execution */
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				// we take the onCloseCallbackFn from the component
				const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

				onCloseCallbackFunc(credential, roles);

				await expectAsync(responsePromise).toBeResolvedTo(roles);
				expect(store.getState().modal.active).toBeFalse();
			});
		});

		describe('after unsuccessful authentication', () => {
			it('closes the modal and resolves with the original response', async () => {
				const responsePromise = bvvSignInProvider();
				await TestUtils.timeout(); /**promise queue execution */
				expect(store.getState().modal.active).toBeTrue();
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				// we take the onCloseCallbackFn from the component
				const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

				onCloseCallbackFunc(null, null);

				await expectAsync(responsePromise).toBeResolvedTo([]);
				expect(store.getState().modal.active).toBeFalse();
			});
		});

		describe('the user closes the modal', () => {
			it('resolves with the original response', async () => {
				const responsePromise = bvvSignInProvider();
				await TestUtils.timeout(); /**promise queue execution */
				expect(store.getState().modal.active).toBeTrue();

				closeModal(); /** we close the modal in order to resolve the promise */

				await expectAsync(responsePromise).toBeResolvedTo([]);
				expect(store.getState().modal.active).toBeFalse();
			});
		});
	});
});

describe('bvvSignOutProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {}
	};

	let store;
	beforeEach(() => {
		store = TestUtils.setupStoreAndDi(
			{},
			{
				notifications: notificationReducer
			}
		);
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('TranslationService', { translate: (key) => key });
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('backend returns status code 200', () => {
		it('returns "true" and informs the user', async () => {
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(backendUrl + 'auth/signout')
				.and.resolveTo(new Response());

			const result = await bvvSignOutProvider();

			expect(result).toBeTrue();
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(store.getState().notifications.latest.payload.content).toBe('global_signOut_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});
	});

	describe('backend returns status code 403', () => {
		it('returns "true" and informs the user', async () => {
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(backendUrl + 'auth/signout')
				.and.resolveTo(new Response());

			const result = await bvvSignOutProvider();

			expect(result).toBeTrue();
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(store.getState().notifications.latest.payload.content).toBe('global_signOut_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});
	});

	describe('backend returns any other status code', () => {
		it('throws an Error', async () => {
			const statusCode = 500;
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(backendUrl + 'auth/signout')
				.and.resolveTo(new Response(null, { status: statusCode }));

			await expectAsync(bvvSignOutProvider()).toBeRejectedWithError(`Sign out not possible: Http-Status ${statusCode}`);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});

describe('bvvInitialAuthStatusProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('backend returns status code 200', () => {
		it('returns the current roles', async () => {
			const backendUrl = 'https://backend.url/';
			const roles = ['Test'];
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(backendUrl + 'auth/roles')
				.and.resolveTo(new Response(JSON.stringify(roles)));

			const result = await bvvInitialAuthStatusProvider();

			expect(result).toEqual(roles);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('backend returns any other status code', () => {
		it('throws an Error', async () => {
			const statusCode = 500;
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(backendUrl + 'auth/roles')
				.and.resolveTo(new Response(null, { status: statusCode }));

			await expectAsync(bvvInitialAuthStatusProvider()).toBeRejectedWithError(`Could not fetch current roles: Http-Status ${statusCode}`);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});

describe('bvvAuthResponseInterceptorProvider', () => {
	const authService = {
		signIn: async () => {},
		isSignedIn: () => false
	};

	let store;
	beforeEach(() => {
		const initialState = {
			modal: {
				active: false
			}
		};
		store = TestUtils.setupStoreAndDi(initialState, { modal: modalReducer });

		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('AuthService', authService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('provides a response interceptor', () => {
		describe('response status code other than 401', () => {
			it('returns the original response', async () => {
				const retTryFetchFn = jasmine.createSpy();
				const mockResponse = { status: 200 };
				const url = 'http://foo.bar';

				await expectAsync(bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url)).toBeResolvedTo(mockResponse);
			});
		});

		describe('response status code is 401', () => {
			describe('we are already signed in', () => {
				it('resolves with the retry response', async () => {
					spyOn(authService, 'isSignedIn').and.returnValue(true);
					const mockResponse = { status: 401 };
					const retryResponse = { status: 200 };
					const url = 'http://foo.bar';
					const retTryFetchFn = jasmine.createSpy().and.resolveTo(retryResponse);
					const responsePromise = bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url);
					await TestUtils.timeout(); /**promise queue execution */

					await expectAsync(responsePromise).toBeResolvedTo(retryResponse);
					expect(retTryFetchFn).toHaveBeenCalled();
					expect(store.getState().modal.active).toBeFalse();
				});
			});

			it('opens an authentication UI for requested roles', async () => {
				const retTryFetchFn = jasmine.createSpy();
				const mockResponse = { status: 401 };
				const url = 'http://foo.bar';
				const roles = ['FOO', 'BAR'];

				const responsePromise = bvvAuthResponseInterceptorProvider(roles)(mockResponse, retTryFetchFn, url);
				await TestUtils.timeout(); /**promise queue execution */

				expect(store.getState().modal.active).toBeTrue();
				const wrapperElementTitle = TestUtils.renderTemplateResult(store.getState().modal.data.title);
				expect(wrapperElementTitle.innerHTML).toContain('global_import_authenticationModal_title&nbsp');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)).toHaveSize(2);
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].label).toBe('FOO');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].size).toBe('1.5');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].color).toBe('var(--text3)');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].background).toBe('var(--primary-color)');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].label).toBe('BAR');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].size).toBe('1.5');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].color).toBe('var(--text3)');
				expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].background).toBe('var(--primary-color)');
				const wrapperElementContent = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElementContent.querySelectorAll(PasswordCredentialPanel.tag)).toHaveSize(1);
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(jasmine.any(Function));
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(jasmine.any(Function));
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).footer).toBeNull();
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).useForm).toBeTrue();
				closeModal(); /** we close the modal in order to resolve the promise */
				await expectAsync(responsePromise).toBeResolved();
			});

			it('opens an authentication UI for role "Plus" containing a special footer', async () => {
				const retTryFetchFn = jasmine.createSpy();
				const mockResponse = { status: 401 };
				const url = 'http://foo.bar';
				const roles = ['FOO', BvvRoles.PLUS];
				const responsePromise = bvvAuthResponseInterceptorProvider(roles)(mockResponse, retTryFetchFn, url);
				await TestUtils.timeout(); /**promise queue execution */

				const wrapperElementContent = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElementContent.querySelectorAll(PasswordCredentialPanel.tag)).toHaveSize(1);
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(jasmine.any(Function));
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(jasmine.any(Function));
				expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).useForm).toBeTrue();
				const wrapperElementFooter = TestUtils.renderTemplateResult(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).footer);
				expect(wrapperElementFooter.querySelectorAll(BvvPlusPasswordCredentialFooter.tag)).toHaveSize(1);
				closeModal(); /** we close the modal in order to resolve the promise */
				await expectAsync(responsePromise).toBeResolved();
			});

			describe('call of the authenticate callback', () => {
				describe('successful', () => {
					it('calls the AuthService and resolves to true', async () => {
						const retTryFetchFn = jasmine.createSpy();
						const mockResponse = { status: 401 };
						const url = 'http://foo.bar';
						const credential = { username: 'u', password: 'p' };
						const responsePromise = bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url);
						await TestUtils.timeout(); /**promise queue execution */
						const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
						// we take the authFn from the component
						const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;
						const authServiceSpy = spyOn(authService, 'signIn').withArgs(credential).and.resolveTo(true);

						await expectAsync(authFunc(credential)).toBeResolvedTo(true);
						expect(authServiceSpy).toHaveBeenCalled();
						closeModal(); /** we close the modal in order to resolve the promise */
						await expectAsync(responsePromise).toBeResolved();
					});
				});

				describe('NOT successful', () => {
					it('calls the AuthService and resolves to false', async () => {
						const retTryFetchFn = jasmine.createSpy();
						const mockResponse = { status: 401 };
						const url = 'http://foo.bar';
						const credential = { username: 'u', password: 'p' };
						const responsePromise = bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url);
						await TestUtils.timeout(); /**promise queue execution */
						const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
						// we take the authFn from the component
						const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;
						const authServiceSpy = spyOn(authService, 'signIn').withArgs(credential).and.resolveTo(false);

						await expectAsync(authFunc(credential)).toBeResolvedTo(false);
						expect(authServiceSpy).toHaveBeenCalled();
						closeModal(); /** we close the modal in order to resolve the promise */
						await expectAsync(responsePromise).toBeResolved();
					});
				});
			});

			describe('call of the onClose callback', () => {
				describe('after successful authentication', () => {
					it('closes the modal and resolves with the retry response', async () => {
						const mockResponse = { status: 401 };
						const retryResponse = { status: 200 };
						const url = 'http://foo.bar';
						const credential = { username: 'u', password: 'p' };
						const retTryFetchFn = jasmine.createSpy().and.resolveTo(retryResponse);
						const responsePromise = bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url);
						await TestUtils.timeout(); /**promise queue execution */
						const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
						// we take the onCloseCallbackFn from the component
						const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

						onCloseCallbackFunc(credential, url);

						await expectAsync(responsePromise).toBeResolvedTo(retryResponse);
						expect(retTryFetchFn).toHaveBeenCalled();
						expect(store.getState().modal.active).toBeFalse();
					});
				});

				describe('after unsuccessful authentication', () => {
					it('closes the modal and resolves with the original response', async () => {
						const mockResponse = { status: 401 };
						const url = 'http://foo.bar';
						const retTryFetchFn = jasmine.createSpy();
						const responsePromise = bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url);
						await TestUtils.timeout(); /**promise queue execution */
						const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
						// we take the onCloseCallbackFn from the component
						const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

						onCloseCallbackFunc(null, null);

						await expectAsync(responsePromise).toBeResolvedTo(mockResponse);
						expect(retTryFetchFn).not.toHaveBeenCalled();
						expect(store.getState().modal.active).toBeFalse();
					});
				});

				describe('the user closes the modal', () => {
					it('resolves with the original response', async () => {
						const mockResponse = { status: 401 };
						const url = 'http://foo.bar';
						const retTryFetchFn = jasmine.createSpy();
						const responsePromise = bvvAuthResponseInterceptorProvider()(mockResponse, retTryFetchFn, url);
						await TestUtils.timeout(); /**promise queue execution */

						closeModal(); /** we close the modal in order to resolve the promise */

						await expectAsync(responsePromise).toBeResolvedTo(mockResponse);
						expect(retTryFetchFn).not.toHaveBeenCalled();
						expect(store.getState().modal.active).toBeFalse();
					});
				});
			});
		});

		it('opens the modal only once per identifier during an configured interval and resolves further calls with the original response', async () => {
			const credentialPanelInterval = 400;
			const mockResponse = { status: 401 };
			const url = 'http://foo.bar';
			const reTryFetchFn = jasmine.createSpy();
			const identifier = createUniqueId();
			const responsePromise = bvvAuthResponseInterceptorProvider([], identifier, credentialPanelInterval)(mockResponse, reTryFetchFn, url);
			await TestUtils.timeout(); /**promise queue execution */
			expect(store.getState().modal.active).toBeTrue();

			closeModal(); /** we close the modal in order to resolve the promise */

			await expectAsync(responsePromise).toBeResolvedTo(mockResponse);
			expect(reTryFetchFn).not.toHaveBeenCalled();
			expect(store.getState().modal.active).toBeFalse();

			// this time the no modal should be shown and the original response returned
			const secondResponsePromise = bvvAuthResponseInterceptorProvider([], identifier, credentialPanelInterval)(mockResponse, reTryFetchFn, url);
			await TestUtils.timeout(); /**promise queue execution */
			expect(store.getState().modal.active).toBeFalse();
			await expectAsync(secondResponsePromise).toBeResolvedTo(mockResponse);

			//when the interval time is elapsed the modal should be shown again
			await TestUtils.timeout(credentialPanelInterval + 100);
			const thirdResponsePromise = bvvAuthResponseInterceptorProvider([], identifier, credentialPanelInterval)(mockResponse, reTryFetchFn, url);
			await TestUtils.timeout(); /**promise queue execution */
			expect(store.getState().modal.active).toBeTrue();
			closeModal(); /** we close the modal in order to resolve the promise */
			await expectAsync(thirdResponsePromise).toBeResolvedTo(mockResponse);
		});
	});
});

describe('BvvCredentialPanelIntervalMs', () => {
	it('returns a constant value', async () => {
		expect(BvvCredentialPanelIntervalMs).toBe(10_000);
	});
});

describe('bvvHttpServiceIgnore401PathProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService);
	});

	afterEach(() => {
		$injector.reset();
	});

	it('returns an array of paths', async () => {
		const backendUrl = 'https://backend.url/';
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

		const result = bvvHttpServiceIgnore401PathProvider();

		expect(result).toEqual([`${backendUrl}sourceType`]);
	});
});
