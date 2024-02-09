import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/domain/mediaTypes';
import { bvvSignInProvider, bvvAuthResponseInterceptor } from '../../../src/services/provider/auth.provider';
import { TestUtils } from '../../test-utils';
import { modalReducer } from '../../../src/store/modal/modal.reducer';
import { PasswordCredentialPanel } from '../../../src/modules/auth/components/PasswordCredentialPanel';
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

describe('getBvvAuthResponseInterceptor', () => {
	const authService = {
		signIn: async () => {}
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

	describe('response status code other than 401', () => {
		it('returns the original response', async () => {
			const retTryFetchFn = jasmine.createSpy();
			const mockResponse = { status: 200 };
			const url = 'http://foo.bar';

			await expectAsync(bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url)).toBeResolvedTo(mockResponse);
		});
	});

	describe('response status code is 401', () => {
		it('opens an authentication UI', async () => {
			const retTryFetchFn = jasmine.createSpy();
			const mockResponse = { status: 401 };
			const url = 'http://foo.bar';

			bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url);

			expect(store.getState().modal.active).toBeTrue();
			expect(store.getState().modal.data.title).toBe('global_import_authenticationModal_title');
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElement.querySelectorAll(PasswordCredentialPanel.tag)).toHaveSize(1);
			expect(wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate).toEqual(jasmine.any(Function));
			expect(wrapperElement.querySelector(PasswordCredentialPanel.tag).onClose).toEqual(jasmine.any(Function));
		});

		describe('call of the authenticate callback', () => {
			describe('successful', () => {
				it('calls the AuthService and resolves to true', async () => {
					const retTryFetchFn = jasmine.createSpy();
					const mockResponse = { status: 401 };
					const url = 'http://foo.bar';
					const credential = { username: 'u', password: 'p' };
					bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url);
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;
					const authServiceSpy = spyOn(authService, 'signIn').withArgs(credential).and.resolveTo(true);

					await expectAsync(authFunc(credential, url)).toBeResolvedTo(true);
					expect(authServiceSpy).toHaveBeenCalled();
				});
			});

			describe('NOT successful', () => {
				it('calls the AuthService and resolves to false', async () => {
					const retTryFetchFn = jasmine.createSpy();
					const mockResponse = { status: 401 };
					const url = 'http://foo.bar';
					const credential = { username: 'u', password: 'p' };
					bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url);
					const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
					// we take the authFn from the component
					const authFunc = wrapperElement.querySelector(PasswordCredentialPanel.tag).authenticate;
					const authServiceSpy = spyOn(authService, 'signIn').withArgs(credential).and.resolveTo(false);

					await expectAsync(authFunc(credential, url)).toBeResolvedTo(false);
					expect(authServiceSpy).toHaveBeenCalled();
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
					const responsePromise = bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url);
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
					const responsePromise = bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url);
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
					const responsePromise = bvvAuthResponseInterceptor(mockResponse, retTryFetchFn, url);

					closeModal();

					await expectAsync(responsePromise).toBeResolvedTo(mockResponse);
					expect(retTryFetchFn).not.toHaveBeenCalled();
					expect(store.getState().modal.active).toBeFalse();
				});
			});
		});
	});
});
