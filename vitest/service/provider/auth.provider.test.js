import { $injector } from '@src/injection';
import { MediaType } from '@src/domain/mediaTypes';
import {
	bvvSignInProvider,
	bvv401InterceptorProvider,
	bvvSignOutProvider,
	bvvHttpServiceIgnore401PathProvider,
	BvvCredentialPanelIntervalMs,
	bvvInitialAuthStatusProvider,
	reSignInWithFetchRetry,
	bvvAuthRoleDowngradeHeaderInterceptorProvider
} from '@src/services/provider/auth.provider';
import { TestUtils } from '@test/test-utils';
import { modalReducer } from '@src/store/modal/modal.reducer';
import { PasswordCredentialPanel } from '@src/modules/auth/components/PasswordCredentialPanel';
import { BvvPlusPasswordCredentialFooter } from '@src/modules/auth/components/BvvPlusPasswordCredentialFooter';
import { Badge } from '@src/modules/commons/components/badge/Badge';
import { closeModal } from '@src/store/modal/modal.action';
import { BvvRoles } from '@src/domain/roles';
import { createUniqueId } from '@src/utils/numberUtils';
import { notificationReducer } from '@src/store/notifications/notifications.reducer';
import { LevelTypes } from '@src/store/notifications/notifications.action';

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

			expect(store.getState().modal.active).toBe(true);
			const wrapperElementTitle = TestUtils.renderTemplateResult(store.getState().modal.data.title);
			expect(wrapperElementTitle.innerHTML).toContain('global_import_authenticationModal_title&nbsp');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)).toHaveLength(1);
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].label).toBe('Plus');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].size).toBe('1.5');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].color).toBe('var(--text5)');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].background).toBe('var(--roles-plus, var(--secondary-color))');
			const wrapperElementContent = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElementContent.querySelectorAll(PasswordCredentialPanel.tag)).toHaveLength(1);
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(expect.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(expect.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).useForm).toBe(true);
			const wrapperElementFooter = TestUtils.renderTemplateResult(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).footer);
			expect(wrapperElementFooter.querySelectorAll(BvvPlusPasswordCredentialFooter.tag)).toHaveLength(1);
			closeModal(); /** we close the modal in order to resolve the promise */
			expect(responsePromise.then(() => true)).resolves.toBe(true);
		});

		describe('call of the authenticate callback', () => {
			describe('credentials are valid', () => {
				it('resolves with the correct role', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
					const roles = ['test'];
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(roles)));
					const responsePromise = bvvSignInProvider();
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;

					expect(authFunc(credential)).resolves.toEqual(roles);
					closeModal(); /** we close the modal in order to resolve the promise */
					expect(responsePromise.then(() => true)).resolves.toBe(true);
					expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
					expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON);
				});
			});

			describe('credentials are not valid', () => {
				it('resolves to false', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 400 }));
					const responsePromise = bvvSignInProvider();
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;

					expect(authFunc(credential)).resolves.toBe(false);
					closeModal(); /** we close the modal in order to resolve the promise */
					expect(responsePromise.then(() => true)).resolves.toBe(true);
					expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
					expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON);
				});
			});

			describe('backend returns any other status code', () => {
				it('throws an error', async () => {
					const statusCode = 500;
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: statusCode }));
					const responsePromise = bvvSignInProvider();
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;

					expect(authFunc(credential)).rejects.toThrow(`Sign in not possible: Http-Status ${statusCode}`);
					closeModal(); /** we close the modal in order to resolve the promise */
					expect(responsePromise.then(() => true)).resolves.toBe(true);
					expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
					expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON);
				});
			});
		});

		describe('credentials are present', () => {
			describe('credentials are valid', () => {
				it('resolves with the correct role', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
					const roles = ['test'];
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(roles)));

					expect(bvvSignInProvider(credential)).resolves.toEqual(roles);
					expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
					expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON);
				});
			});

			describe('credentials are not valid', () => {
				it('resolves to false', async () => {
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 400 }));

					expect(bvvSignInProvider(credential)).resolves.toBe(false);
					expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
					expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON);
				});
			});

			describe('backend returns any other status code', () => {
				it('throws an error', async () => {
					const statusCode = 500;
					const backendUrl = 'https://backend.url/';
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
					const credential = { username: 'u', password: 'p' };
					const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: statusCode }));

					expect(bvvSignInProvider(credential)).rejects.toThrow(`Sign in not possible: Http-Status ${statusCode}`);
					expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
					expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON);
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

				expect(responsePromise).resolves.toEqual(roles);
				expect(store.getState().modal.active).toBe(false);
			});
		});

		describe('after unsuccessful authentication', () => {
			it('closes the modal and resolves with the original response', async () => {
				const responsePromise = bvvSignInProvider();
				await TestUtils.timeout(); /**promise queue execution */
				expect(store.getState().modal.active).toBe(true);
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				// we take the onCloseCallbackFn from the component
				const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

				onCloseCallbackFunc(null, null);

				expect(responsePromise).resolves.toEqual([]);
				expect(store.getState().modal.active).toBe(false);
			});
		});

		describe('the user closes the modal', () => {
			it('resolves with the original response', async () => {
				const responsePromise = bvvSignInProvider();
				await TestUtils.timeout(); /**promise queue execution */
				expect(store.getState().modal.active).toBe(true);

				closeModal(); /** we close the modal in order to resolve the promise */

				expect(responsePromise).resolves.toEqual([]);
				expect(store.getState().modal.active).toBe(false);
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
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response());

			const result = await bvvSignOutProvider();

			expect(result).toBe(true);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signout');
			expect(store.getState().notifications.latest.payload.content).toBe('global_signOut_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});
	});

	describe('backend returns status code 403', () => {
		it('returns "true" and informs the user', async () => {
			const statusCode = 403;
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: statusCode }));

			const result = await bvvSignOutProvider();

			expect(result).toBe(true);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signout');
			expect(store.getState().notifications.latest.payload.content).toBe('global_signOut_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});
	});

	describe('backend returns any other status code', () => {
		it('throws an Error', async () => {
			const statusCode = 500;
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: statusCode }));

			expect(bvvSignOutProvider()).rejects.toThrow(`Sign out not possible: Http-Status ${statusCode}`);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/signout');
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
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(roles)));

			const result = await bvvInitialAuthStatusProvider();

			expect(result).toEqual(roles);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/roles');
		});
	});

	describe('backend returns any other status code', () => {
		it('throws an Error', async () => {
			const statusCode = 500;
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: statusCode }));

			expect(bvvInitialAuthStatusProvider()).rejects.toThrow(`Could not fetch current roles: Http-Status ${statusCode}`);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'auth/roles');
		});
	});
});

describe('reSignInWithFetchRetry', () => {
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

	describe('returns a promise', () => {
		describe('we are already signed in', () => {
			it('resolves with the retry response', async () => {
				vi.spyOn(authService, 'isSignedIn').mockReturnValue(true);
				const mockResponse = { status: 401 };
				const retryResponse = { status: 200 };
				const retTryFetchFn = vi.fn().mockResolvedValue(retryResponse);
				const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn);
				await TestUtils.timeout(); /**promise queue execution */

				expect(responsePromise).resolves.toEqual(retryResponse);
				expect(retTryFetchFn).toHaveBeenCalled();
				expect(store.getState().modal.active).toBe(false);
			});
		});

		it('opens an authentication UI for requested roles', async () => {
			const retTryFetchFn = vi.fn();
			const mockResponse = { status: 401 };
			const roles = ['FOO', 'BAR'];

			const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn, roles);
			await TestUtils.timeout(); /**promise queue execution */

			expect(store.getState().modal.active).toBe(true);
			const wrapperElementTitle = TestUtils.renderTemplateResult(store.getState().modal.data.title);
			expect(wrapperElementTitle.innerHTML).toContain('global_import_authenticationModal_title&nbsp');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)).toHaveLength(2);
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].label).toBe('FOO');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].size).toBe('1.5');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].color).toBe('var(--text5)');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[0].background).toBe('var(--roles-foo, var(--secondary-color))');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].label).toBe('BAR');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].size).toBe('1.5');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].color).toBe('var(--text5)');
			expect(wrapperElementTitle.querySelectorAll(Badge.tag)[1].background).toBe('var(--roles-bar, var(--secondary-color))');
			const wrapperElementContent = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElementContent.querySelectorAll(PasswordCredentialPanel.tag)).toHaveLength(1);
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(expect.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(expect.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).footer).toBeNull();
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).useForm).toBe(true);
			closeModal(); /** we close the modal in order to resolve the promise */
			expect(responsePromise.then(() => true)).resolves.toBe(true);
		});

		it('opens an authentication UI for role "Plus" containing a special footer', async () => {
			const retTryFetchFn = vi.fn();
			const mockResponse = { status: 401 };
			const roles = ['FOO', BvvRoles.PLUS];

			const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn, roles);
			await TestUtils.timeout(); /**promise queue execution */

			const wrapperElementContent = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElementContent.querySelectorAll(PasswordCredentialPanel.tag)).toHaveLength(1);
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(expect.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(expect.any(Function));
			expect(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).useForm).toBe(true);
			const wrapperElementFooter = TestUtils.renderTemplateResult(wrapperElementContent.querySelector(PasswordCredentialPanel.tag).footer);
			expect(wrapperElementFooter.querySelectorAll(BvvPlusPasswordCredentialFooter.tag)).toHaveLength(1);
			closeModal(); /** we close the modal in order to resolve the promise */
			expect(responsePromise.then(() => true)).resolves.toBe(true);
		});

		describe('call of the authenticate callback', () => {
			describe('successful', () => {
				it('calls the AuthService and resolves to true', async () => {
					const retTryFetchFn = vi.fn();
					const mockResponse = { status: 401 };
					const credential = { username: 'u', password: 'p' };
					const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn);
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;
					const authServiceSpy = vi.spyOn(authService, 'signIn').mockResolvedValue(true);

					expect(authFunc(credential)).resolves.toBe(true);
					expect(authServiceSpy).toHaveBeenCalledWith(credential);
					closeModal(); /** we close the modal in order to resolve the promise */
					expect(responsePromise.then(() => true)).resolves.toBe(true);
				});
			});

			describe('NOT successful', () => {
				it('calls the AuthService and resolves to false', async () => {
					const retTryFetchFn = vi.fn();
					const mockResponse = { status: 401 };
					const credential = { username: 'u', password: 'p' };
					const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn);
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;
					const authServiceSpy = vi.spyOn(authService, 'signIn').mockResolvedValue(false);

					expect(authFunc(credential)).resolves.toBe(false);
					expect(authServiceSpy).toHaveBeenCalledWith(credential);
					closeModal(); /** we close the modal in order to resolve the promise */
					expect(responsePromise.then(() => true)).resolves.toBe(true);
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
					const retTryFetchFn = vi.fn().mockResolvedValue(retryResponse);
					const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn);
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the onCloseCallbackFn from the component
					const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

					onCloseCallbackFunc(credential, url);

					expect(responsePromise).resolves.toBe(retryResponse);
					expect(retTryFetchFn).toHaveBeenCalled();
					expect(store.getState().modal.active).toBe(false);
				});
			});

			describe('after unsuccessful authentication', () => {
				it('closes the modal and resolves with the original response', async () => {
					const mockResponse = { status: 401 };
					const retTryFetchFn = vi.fn();
					const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn);
					await TestUtils.timeout(); /**promise queue execution */
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the onCloseCallbackFn from the component
					const onCloseCallbackFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose;

					onCloseCallbackFunc(null, null);

					expect(responsePromise).resolves.toEqual(mockResponse);
					expect(retTryFetchFn).not.toHaveBeenCalled();
					expect(store.getState().modal.active).toBe(false);
				});
			});

			describe('the user closes the modal', () => {
				it('resolves with the original response', async () => {
					const mockResponse = { status: 401 };
					const retTryFetchFn = vi.fn();
					const responsePromise = reSignInWithFetchRetry(mockResponse, retTryFetchFn);
					await TestUtils.timeout(); /**promise queue execution */

					closeModal(); /** we close the modal in order to resolve the promise */

					expect(responsePromise).resolves.toEqual(mockResponse);
					expect(retTryFetchFn).not.toHaveBeenCalled();
					expect(store.getState().modal.active).toBe(false);
				});
			});
		});
	});

	it('opens the modal only once per identifier during an configured interval and resolves further calls with the original response', async () => {
		const credentialPanelInterval = 400;
		const mockResponse = { status: 401 };
		const reTryFetchFn = vi.fn();
		const identifier = createUniqueId();
		const responsePromise = reSignInWithFetchRetry(mockResponse, reTryFetchFn, [], identifier, credentialPanelInterval);

		await TestUtils.timeout(); /**promise queue execution */
		expect(store.getState().modal.active).toBe(true);

		closeModal(); /** we close the modal in order to resolve the promise */

		expect(responsePromise).resolves.toEqual(mockResponse);
		expect(reTryFetchFn).not.toHaveBeenCalled();
		expect(store.getState().modal.active).toBe(false);

		// this time no modal should be shown and the original response returned
		const secondResponsePromise = reSignInWithFetchRetry(mockResponse, reTryFetchFn, [], identifier, credentialPanelInterval);
		await TestUtils.timeout(); /**promise queue execution */
		expect(store.getState().modal.active).toBe(false);
		expect(secondResponsePromise).resolves.toEqual(mockResponse);

		//when the interval time is elapsed the modal should be shown again
		await TestUtils.timeout(credentialPanelInterval + 100);
		const thirdResponsePromise = reSignInWithFetchRetry(mockResponse, reTryFetchFn, [], identifier, credentialPanelInterval);
		await TestUtils.timeout(); /**promise queue execution */
		expect(store.getState().modal.active).toBe(true);
		closeModal(); /** we close the modal in order to resolve the promise */
		expect(thirdResponsePromise).resolves.toEqual(mockResponse);
	});
});

describe('bvv401InterceptorProvider', () => {
	describe('provides a response interceptor', () => {
		describe('response status code other than 401', () => {
			it('returns the original response', async () => {
				const retTryFetchFn = vi.fn();
				const mockResponse = { status: 200 };
				const url = 'http://foo.bar';

				expect(bvv401InterceptorProvider()(mockResponse, retTryFetchFn, url)).resolves.toEqual(mockResponse);
			});
		});

		describe('response status code is 401', () => {
			it('calls the `reSignInWithFetchRetry` fn', async () => {
				const mockResponse = { status: 401 };
				const retryResponse = { status: 200 };
				const url = 'http://foo.bar';
				const identifier = 'identifier';
				const roles = ['role'];
				const interval = 0;
				const retTryFetchFn = vi.fn();
				const reSignInWithFetchRetry = vi.fn().mockResolvedValue(retryResponse);
				const responsePromise = bvv401InterceptorProvider(roles, identifier, interval, reSignInWithFetchRetry)(mockResponse, retTryFetchFn, url);
				await TestUtils.timeout(); /**promise queue execution */

				expect(responsePromise).resolves.toEqual(retryResponse);
				expect(reSignInWithFetchRetry).toHaveBeenCalledWith(mockResponse, retTryFetchFn, roles, identifier, interval);
			});
		});
	});
});

describe('bvvAuthRoleDowngradeHeaderInterceptorProvider', () => {
	const authService = {
		invalidate: () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('AuthService', authService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('provides a response interceptor', () => {
		describe('`x-auth-role-downgrade` response header is NOT available', () => {
			it('returns the original response', async () => {
				const retTryFetchFn = vi.fn();
				const mockResponse = { status: 200, headers: new Headers() };

				expect(bvvAuthRoleDowngradeHeaderInterceptorProvider()(mockResponse, retTryFetchFn)).resolves.toEqual(mockResponse);
			});
		});

		describe('`x-auth-role-downgrade` response header is NOT available', () => {
			it('calls the `reSignInWithFetchRetry` fn', async () => {
				const invalidateSpy = vi.spyOn(authService, 'invalidate');
				const roles = 'role0,role1';
				const headers = new Headers();
				headers.set('x-auth-role-downgrade', roles);
				const mockResponse = { status: 200, headers };
				const retryResponse = { status: 200 };
				const interval = 0;
				const retTryFetchFn = vi.fn();
				const reSignInWithFetchRetry = vi.fn().mockResolvedValue(retryResponse);
				const responsePromise = bvvAuthRoleDowngradeHeaderInterceptorProvider(interval, reSignInWithFetchRetry)(mockResponse, retTryFetchFn);
				await TestUtils.timeout(); /**promise queue execution */

				expect(responsePromise).resolves.toEqual(retryResponse);
				expect(reSignInWithFetchRetry).toHaveBeenCalledWith(
					mockResponse,
					retTryFetchFn,
					roles.split(','),
					'bvvAuthRoleDowngradeInterceptorProvider',
					interval
				);
				expect(invalidateSpy).toHaveBeenCalled();
			});
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
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

		const result = bvvHttpServiceIgnore401PathProvider();

		expect(result).toEqual([`${backendUrl}sourceType`]);
		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
	});
});
