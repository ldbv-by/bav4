import { $injector } from '@src/injection';
import { HttpService, AuthInvalidatingAfter401HttpService, NetworkStateSyncHttpService, BvvHttpService } from '@src/services/HttpService';
import { bvvHttpServiceIgnore401PathProvider } from '@src/services/provider/auth.provider';
import { networkReducer } from '@src/store/network/network.reducer';
import { TestUtils } from '@test/test-utils';

const defaultInterceptors = { response: [] };

describe('HttpService', () => {
	beforeEach(function () {
		vi.useFakeTimers();
	});

	afterEach(function () {
		vi.useRealTimers();
		$injector.reset();
	});

	describe('static properties', () => {
		it('provides a default request mode', () => {
			expect(HttpService.DEFAULT_REQUEST_MODE).toBe('cors');
		});
		it('provides a default timeout', () => {
			expect(HttpService.DEFAULT_TIMEOUT).toBe(10_000);
		});
	});

	describe('fetch', () => {
		it('provides a result', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(window, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.fetch(url);

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith(url, expect.objectContaining({ signal: expect.any(AbortSignal) }));
			expect(result.text()).toBe(42);
		});

		it('provides a result setting the credentials options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			vi.spyOn(window, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.fetch(url);

			expect(result.text()).toBe(42);
		});

		it('provides a result by calling response interceptors chained', async () => {
			const originalResponseMock = { value: 40 };
			const responseIcMock0 = { value: 41 };
			const responseIcMock1 = { value: 42 };
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(window, 'fetch').mockResolvedValue(originalResponseMock);
			const interceptorSpy0 = vi.fn().mockResolvedValue(responseIcMock0);
			const interceptorSpy1 = vi.fn().mockResolvedValue(responseIcMock1);

			const result = await httpService.fetch(url, undefined, undefined, { response: [interceptorSpy0, interceptorSpy1] });

			expect(spy).toHaveBeenCalled();
			expect(interceptorSpy0).toHaveBeenCalledWith(originalResponseMock, expect.any(Function), url);
			expect(interceptorSpy1).toHaveBeenCalledWith(responseIcMock0, expect.any(Function), url);
			expect(result.value).toBe(42);
		});

		it('provides a result with customized timeout ', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(() => {
				// we wait 2000ms in order to exceed the default timeout limit
				vi.advanceTimersByTime(2000);
				// and return mocked result
				return Promise.resolve({
					text: () => {
						return 42;
					}
				});
			});

			const result = await httpService.fetch(url, { timeout: 3000 });

			expect(fetchSpy).toHaveBeenCalled();
			expect(result.text()).toBe(42);
		});

		it('aborts the request when default timeout limit is exceeded', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();

			const controller = new AbortController();
			const controllerSpy = vi.spyOn(controller, 'abort');
			const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(() => {
				// we wait 2000ms in order to exceed the default timeout limit
				vi.advanceTimersByTime(HttpService.DEFAULT_TIMEOUT + 1_000);
			});

			await httpService.fetch(url, {}, controller);

			expect(fetchSpy).toHaveBeenCalled();
			expect(controllerSpy).toHaveBeenCalled();
		});
	});

	describe('get', () => {
		it('provides a result with default options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.get(url);

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE }, undefined, defaultInterceptors);
			expect(result.text()).toBe(42);
		});

		it('provides a result by calling a response interceptor', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});
			const interceptors = { response: [vi.fn().mockImplementation(async (response) => response)] };

			const result = await httpService.get(url, {}, interceptors);

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE }, undefined, interceptors);
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.get(url, { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE, timeout: 2000 }, undefined, defaultInterceptors);
			expect(result.text()).toBe(42);
		});
	});

	describe('delete', () => {
		it('provides a result with default options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.delete(url);

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE, method: 'DELETE' });
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.delete(url, { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE, method: 'DELETE', timeout: 2000 });
			expect(result.text()).toBe(42);
		});
	});

	describe('post', () => {
		it('post data and provides a result with default options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.post(url, 'someData', 'someContentType');

			expect(spy).toHaveBeenCalledWith(
				url,
				{
					method: 'POST',
					body: 'someData',
					mode: HttpService.DEFAULT_REQUEST_MODE,
					headers: {
						'Content-Type': 'someContentType'
					}
				},
				undefined,
				defaultInterceptors
			);
			expect(result.text()).toBe(42);
		});

		it('provides a result by calling a response interceptor', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});
			const interceptors = { response: [vi.fn().mockImplementation(async (response) => response)] };

			const result = await httpService.post(url, 'someData', 'someContentType', null, interceptors);

			expect(spy).toHaveBeenCalledWith(
				url,
				{
					method: 'POST',
					body: 'someData',
					mode: HttpService.DEFAULT_REQUEST_MODE,
					headers: {
						'Content-Type': 'someContentType'
					}
				},
				undefined,
				interceptors
			);
			expect(result.text()).toBe(42);
		});

		it('post data and provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});

			const result = await httpService.post(url, 'someData', 'someContentType', { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith(
				url,
				{
					method: 'POST',
					body: 'someData',
					mode: HttpService.DEFAULT_REQUEST_MODE,
					timeout: 2000,
					headers: {
						'Content-Type': 'someContentType'
					}
				},
				undefined,
				defaultInterceptors
			);
			expect(result.text()).toBe(42);
		});
	});

	describe('head', () => {
		it('provides a result with default options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				ok: true
			});

			const result = await httpService.head(url);

			expect(spy).toHaveBeenCalledWith(
				url,
				{
					method: 'HEAD',
					mode: HttpService.DEFAULT_REQUEST_MODE
				},
				undefined,
				defaultInterceptors
			);
			expect(result.ok).toBe(true);
		});

		it('provides a result by calling a response interceptor', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				text: () => {
					return 42;
				}
			});
			const interceptors = { response: [vi.fn().mockImplementation(async (response) => response)] };

			const result = await httpService.head(url, {}, interceptors);

			expect(spy).toHaveBeenCalledWith(url, { method: 'HEAD', mode: HttpService.DEFAULT_REQUEST_MODE }, undefined, interceptors);
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = vi.spyOn(httpService, 'fetch').mockResolvedValue({
				ok: true
			});

			const result = await httpService.head(url, { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith(
				url,
				{
					method: 'HEAD',
					mode: HttpService.DEFAULT_REQUEST_MODE,
					timeout: 2000
				},
				undefined,
				defaultInterceptors
			);
			expect(result.ok).toBe(true);
		});
	});
});

describe('NetworkStateSyncHttpService', () => {
	const configService = {
		getValue: () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		$injector.reset();
	});

	const setup = () => {
		return TestUtils.setupStoreAndDi(
			{},
			{
				network: networkReducer
			}
		);
	};

	describe('fetch', () => {
		it("calls parent's fetch and updates the store", async () => {
			const url = 'http://foo.bar';
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			vi.spyOn(window, 'fetch').mockImplementation(() => {
				expect(store.getState().network.fetching).toBe(true);
				return Promise.resolve({
					text: () => {
						return 42;
					}
				});
			});
			const parentFetchSpy = vi.spyOn(HttpService.prototype, 'fetch');

			const result = await instanceUnderTest.fetch(url);

			expect(store.getState().network.fetching).toBe(false);
			expect(result.text()).toBe(42);
			expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), defaultInterceptors);
		});

		it('regards pending responses', async () => {
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			vi.spyOn(window, 'fetch').mockImplementation(async () => {});

			instanceUnderTest.fetch('first');
			instanceUnderTest.fetch('second');

			expect(store.getState().network.fetching).toBe(true);

			await instanceUnderTest.fetch('third');

			expect(store.getState().network.fetching).toBe(false);
		});

		it('regards pending responses when not resolved', async () => {
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			vi.spyOn(window, 'fetch').mockImplementation(async () => {
				throw new Error('oops');
			});

			try {
				await instanceUnderTest.fetch('first');
				throw new Error('Promise should not be resolved');
			} catch {
				expect(store.getState().network.fetching).toBe(false);
			}
		});

		it('updates the store when fetch call fails', async () => {
			const url = 'http://foo.bar';
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			vi.spyOn(window, 'fetch').mockImplementation(() => {
				expect(store.getState().network.fetching).toBe(true);
				return Promise.reject('something got wrong');
			});

			try {
				await instanceUnderTest.fetch(url);
				throw new Error('Promise should not be resolved');
			} catch {
				expect(store.getState().network.fetching).toBe(false);
			}
		});
	});
});

describe('AuthInvalidatingAfter401HttpService', () => {
	const configService = {
		getValueAsPath: () => {}
	};
	const authService = {
		invalidate: () => {}
	};

	afterEach(() => {
		$injector.reset();
	});

	const setup = (httpServiceIgnore401PathProvider = bvvHttpServiceIgnore401PathProvider) => {
		TestUtils.setupStoreAndDi({}, {});
		$injector.registerSingleton('ConfigService', configService).registerSingleton('AuthService', authService);
		return new AuthInvalidatingAfter401HttpService(httpServiceIgnore401PathProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			setup();
			const instanceUnderTest = new AuthInvalidatingAfter401HttpService();
			expect(instanceUnderTest._ignorePathProvider).toEqual(bvvHttpServiceIgnore401PathProvider);
		});

		it('initializes the service with custom providers', async () => {
			const customHttpServiceIgnore401PathProvider = () => [];
			const instanceUnderTest = setup(customHttpServiceIgnore401PathProvider);
			expect(instanceUnderTest._ignorePathProvider).toEqual(customHttpServiceIgnore401PathProvider);
		});
	});

	describe('fetch', () => {
		describe('endpoint returns 401', () => {
			it("calls parent's fetch and invalidates existing authentication", async () => {
				const url = 'http://foo.bar';
				const mockHttpServiceIgnore401PathProvider = () => [];
				const instanceUnderTest = setup(mockHttpServiceIgnore401PathProvider);
				vi.spyOn(window, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));
				vi.spyOn(configService, 'getValueAsPath').mockReturnValue(url);
				const parentFetchSpy = vi.spyOn(NetworkStateSyncHttpService.prototype, 'fetch');
				const authSpy = vi.spyOn(authService, 'invalidate');

				const result = await instanceUnderTest.fetch(url);

				expect(authSpy).toHaveBeenCalled();
				expect(result.status).toBe(401);
				expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), { response: [expect.any(Function)] });
			});

			describe('endpoint is excluded', () => {
				it("calls only parent's fetch", async () => {
					const url = 'http://foo.bar';
					const mockHttpServiceIgnore401PathProvider = () => ['foo.bar'];
					const instanceUnderTest = setup(mockHttpServiceIgnore401PathProvider);
					vi.spyOn(window, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));
					vi.spyOn(configService, 'getValueAsPath').mockReturnValue(url);
					const parentFetchSpy = vi.spyOn(NetworkStateSyncHttpService.prototype, 'fetch');
					const authSpy = vi.spyOn(authService, 'invalidate');

					const result = await instanceUnderTest.fetch(url);

					expect(authSpy).not.toHaveBeenCalled();
					expect(result.status).toBe(401);
					expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), { response: [expect.any(Function)] });
				});
			});

			describe('endpoint is is not a backend endpoint', () => {
				it("calls only parent's fetch", async () => {
					const url = 'http://foo.bar';
					const mockHttpServiceIgnore401PathProvider = () => [];
					const instanceUnderTest = setup(mockHttpServiceIgnore401PathProvider);
					vi.spyOn(window, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));
					vi.spyOn(configService, 'getValueAsPath').mockReturnValue('http://backend.url');
					const parentFetchSpy = vi.spyOn(NetworkStateSyncHttpService.prototype, 'fetch');
					const authSpy = vi.spyOn(authService, 'invalidate');

					const result = await instanceUnderTest.fetch(url);

					expect(authSpy).not.toHaveBeenCalled();
					expect(result.status).toBe(401);
					expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), { response: [expect.any(Function)] });
				});
			});
		});

		describe('endpoint returns other than 401', () => {
			it("calls only parent's fetch", async () => {
				const url = 'http://foo.bar';
				const mockHttpServiceIgnore401PathProvider = () => [];
				const instanceUnderTest = setup(mockHttpServiceIgnore401PathProvider);
				vi.spyOn(window, 'fetch').mockResolvedValue(new Response(null, { status: 400 }));
				const parentFetchSpy = vi.spyOn(NetworkStateSyncHttpService.prototype, 'fetch');
				const authSpy = vi.spyOn(authService, 'invalidate');

				const result = await instanceUnderTest.fetch(url);

				expect(authSpy).not.toHaveBeenCalled();
				expect(result.status).toBe(400);
				expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), { response: [expect.any(Function)] });
			});
		});
	});
});

describe('BvvHttpService', () => {
	const environmentService = {
		isStandalone: () => false
	};
	const configService = {
		getValueAsPath: () => {}
	};
	const authService = {
		invalidate: () => {}
	};

	afterEach(() => {
		$injector.reset();
	});

	afterEach(() => {
		$injector.reset();
	});

	const setup = () => {
		TestUtils.setupStoreAndDi({}, {});
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('AuthService', authService)
			.registerSingleton('EnvironmentService', environmentService);
		return new BvvHttpService();
	};

	describe('fetch', () => {
		describe('in standalone mode', () => {
			it("always calls the parent's fetch and does not set the 'credentials' option", async () => {
				const url = 'http://backend.url/foo';
				const instanceUnderTest = setup();
				vi.spyOn(window, 'fetch').mockImplementation(() => {
					return Promise.resolve({
						text: () => {
							return 42;
						}
					});
				});
				vi.spyOn(environmentService, 'isStandalone').mockReturnValue(true);
				const parentFetchSpy = vi.spyOn(AuthInvalidatingAfter401HttpService.prototype, 'fetch');
				vi.spyOn(configService, 'getValueAsPath').mockImplementation('http://backend.url');

				const result = await instanceUnderTest.fetch(url);

				expect(result.text()).toBe(42);
				expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), defaultInterceptors);
			});
		});
		describe('backend resource', () => {
			it("calls the parent's fetch and adds the 'credentials' option", async () => {
				const url = 'http://backend.url/foo';
				const instanceUnderTest = setup();
				vi.spyOn(window, 'fetch').mockImplementation(() => {
					return Promise.resolve({
						text: () => {
							return 42;
						},
						headers: new Headers()
					});
				});
				const parentFetchSpy = vi.spyOn(AuthInvalidatingAfter401HttpService.prototype, 'fetch');
				vi.spyOn(configService, 'getValueAsPath').mockReturnValue('http://backend.url');

				const result = await instanceUnderTest.fetch(url);

				expect(result.text()).toBe(42);
				expect(parentFetchSpy).toHaveBeenCalledWith(url, { credentials: 'include' }, expect.any(AbortController), {
					response: [...defaultInterceptors.response, expect.any(Function)]
				});
			});
		});

		describe('any other resource', () => {
			it("calls the parent's fetch and does not set the 'credentials' option", async () => {
				const url = 'http://some.url/foo';
				const instanceUnderTest = setup();
				vi.spyOn(window, 'fetch').mockImplementation(() => {
					return Promise.resolve({
						text: () => {
							return 42;
						},
						headers: new Headers()
					});
				});
				const parentFetchSpy = vi.spyOn(AuthInvalidatingAfter401HttpService.prototype, 'fetch');
				vi.spyOn(configService, 'getValueAsPath').mockReturnValue('http://backend.url');

				const result = await instanceUnderTest.fetch(url);

				expect(result.text()).toBe(42);
				expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, expect.any(AbortController), {
					response: [...defaultInterceptors.response, expect.any(Function)]
				});
			});
		});

		it("calls parent's fetch and uses a custom 'credentials' option", async () => {
			const url = 'http://foo.bar';
			const instanceUnderTest = setup();
			vi.spyOn(window, 'fetch').mockImplementation(() => {
				return Promise.resolve({
					text: () => {
						return 42;
					},
					headers: new Headers()
				});
			});
			const parentFetchSpy = vi.spyOn(AuthInvalidatingAfter401HttpService.prototype, 'fetch');

			const result = await instanceUnderTest.fetch(url, { credentials: 'omit' });

			expect(result.text()).toBe(42);
			expect(parentFetchSpy).toHaveBeenCalledWith(url, { credentials: 'omit' }, expect.any(AbortController), {
				response: [...defaultInterceptors.response, expect.any(Function)]
			});
		});
	});
});
