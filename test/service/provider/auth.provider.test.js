import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/domain/mediaTypes';
import { bvvSignInProvider, bvvAuthResponseInterceptorProvider } from '../../../src/services/provider/auth.provider';
import { TestUtils } from '../../test-utils';
import { modalReducer } from '../../../src/store/modal/modal.reducer';
import { PasswordCredentialPanel } from '../../../src/modules/auth/components/PasswordCredentialPanel';
import { Badge } from '../../../src/modules/commons/components/badge/Badge';
import { closeModal } from '../../../src/store/modal/modal.action';

describe('bvvSignInProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		post: async () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('credentials are valid', () => {
		it('returns the roles for this user', async () => {
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'u', password: 'p' };
			const roles = ['test'];
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
				.and.resolveTo(new Response(JSON.stringify(roles)));

			const result = await bvvSignInProvider(credential);

			expect(result).toEqual(roles);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('credentials are NOT valid', () => {
		it('returns an empty array as roles', async () => {
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'u', password: 'p' };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
				.and.resolveTo(new Response(null, { status: 400 }));

			const result = await bvvSignInProvider(credential);

			expect(result).toEqual([]);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('backend return any other status code', () => {
		it('throws an Error', async () => {
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
				expect(wrapperElementTitle.textContent).toContain('global_import_authenticationModal_title');
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

						await expectAsync(authFunc(credential, url)).toBeResolvedTo(true);
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

						await expectAsync(authFunc(credential, url)).toBeResolvedTo(false);
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

						closeModal();

						await expectAsync(responsePromise).toBeResolvedTo(mockResponse);
						expect(retTryFetchFn).not.toHaveBeenCalled();
						expect(store.getState().modal.active).toBeFalse();
						await expectAsync(responsePromise).toBeResolved();
					});
				});
			});
		});
	});
});
