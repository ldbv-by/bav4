import { $injector } from '../../src/injection';
import { HttpService, NetworkStateSyncHttpService } from '../../src/services/HttpService';
import { networkReducer } from '../../src/store/network/network.reducer';
import { TestUtils } from '../test-utils';

const defaultInterceptors = { response: [] };

describe('HttpService', () => {
	const configService = {
		getValue: () => {}
	};

	beforeEach(function () {
		$injector.registerSingleton('ConfigService', configService);
		jasmine.clock().install();
	});

	afterEach(function () {
		jasmine.clock().uninstall();
		$injector.reset();
	});

	describe('static properties', () => {
		it('provides a DefaultRequestMode', () => {
			expect(HttpService.DEFAULT_REQUEST_MODE).toBe('cors');
		});
	});

	describe('fetch', () => {
		it('provides a result', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(window, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

			const result = await httpService.fetch(url);

			expect(spy).toHaveBeenCalledOnceWith(url, jasmine.objectContaining({ signal: jasmine.any(AbortSignal) }));
			expect(result.text()).toBe(42);
		});

		it('provides a result setting the credentials options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(window, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);
			spyOn(configService, 'getValue').withArgs('FETCH_API_CREDENTIALS', 'same-origin').and.returnValue('include');

			const result = await httpService.fetch(url);
			expect(spy).toHaveBeenCalledOnceWith(url, jasmine.objectContaining({ credentials: 'include' }));
			expect(result.text()).toBe(42);
		});

		it('provides a result by calling response interceptors chained', async () => {
			const originalResponseMock = { value: 40 };
			const responseIcMock0 = { value: 41 };
			const responseIcMock1 = { value: 42 };
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(window, 'fetch').and.resolveTo(originalResponseMock);
			const interceptorSpy0 = jasmine.createSpy().and.resolveTo(responseIcMock0);
			const interceptorSpy1 = jasmine.createSpy().and.resolveTo(responseIcMock1);

			const result = await httpService.fetch(url, undefined, undefined, { response: [interceptorSpy0, interceptorSpy1] });

			expect(spy).toHaveBeenCalled();
			expect(interceptorSpy0).toHaveBeenCalledWith(originalResponseMock, jasmine.any(Function), url);
			expect(interceptorSpy1).toHaveBeenCalledWith(responseIcMock0, jasmine.any(Function), url);
			expect(result.value).toBe(42);
		});

		it('provides a result with customized timeout ', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const fetchSpy = spyOn(window, 'fetch').and.callFake(() => {
				// we wait 2000ms in order to exceed the default timeout limit
				jasmine.clock().tick(2000);
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
			const controllerSpy = spyOn(controller, 'abort');
			const fetchSpy = spyOn(window, 'fetch').and.callFake(() => {
				// we wait 2000ms in order to exceed the default timeout limit
				jasmine.clock().tick(2000);
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
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

			const result = await httpService.get(url);

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE }, undefined, defaultInterceptors);
			expect(result.text()).toBe(42);
		});

		it('provides a result by calling a response interceptor', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);
			const interceptors = { response: [jasmine.createSpy().and.callFake(async (response) => response)] };

			const result = await httpService.get(url, {}, interceptors);

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE }, undefined, interceptors);
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

			const result = await httpService.get(url, { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE, timeout: 2000 }, undefined, defaultInterceptors);
			expect(result.text()).toBe(42);
		});
	});

	describe('delete', () => {
		it('provides a result with default options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

			const result = await httpService.delete(url);

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE, method: 'DELETE' });
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

			const result = await httpService.delete(url, { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith(url, { mode: HttpService.DEFAULT_REQUEST_MODE, method: 'DELETE', timeout: 2000 });
			expect(result.text()).toBe(42);
		});
	});

	describe('post', () => {
		it('post data and provides a result with default options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

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
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);
			const interceptors = { response: [jasmine.createSpy().and.callFake(async (response) => response)] };

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
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);

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
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					ok: true
				})
			);

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
			expect(result.ok).toBeTrue();
		});

		it('provides a result by calling a response interceptor', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					text: () => {
						return 42;
					}
				})
			);
			const interceptors = { response: [jasmine.createSpy().and.callFake(async (response) => response)] };

			const result = await httpService.head(url, {}, interceptors);

			expect(spy).toHaveBeenCalledWith(url, { method: 'HEAD', mode: HttpService.DEFAULT_REQUEST_MODE }, undefined, interceptors);
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const url = 'http://foo.bar';
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(
				Promise.resolve({
					ok: true
				})
			);

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
			expect(result.ok).toBeTrue();
		});
	});
});

describe('NetworkStateSyncHttpService', () => {
	const configService = {
		getValue: () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService);
		jasmine.clock().install();
	});

	afterEach(() => {
		jasmine.clock().uninstall();
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
			spyOn(window, 'fetch').and.callFake(() => {
				expect(store.getState().network.fetching).toBeTrue();
				return Promise.resolve({
					text: () => {
						return 42;
					}
				});
			});
			const parentFetchSpy = spyOn(HttpService.prototype, 'fetch').and.callThrough();

			const result = await instanceUnderTest.fetch(url);

			expect(store.getState().network.fetching).toBeFalse();
			expect(result.text()).toBe(42);
			expect(parentFetchSpy).toHaveBeenCalledWith(url, {}, jasmine.any(AbortController), defaultInterceptors);
		});

		it('regards pending responses', async () => {
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			spyOn(window, 'fetch').and.callFake(async () => {});

			instanceUnderTest.fetch('first');
			instanceUnderTest.fetch('second');

			expect(store.getState().network.fetching).toBeTrue();

			await instanceUnderTest.fetch('third');

			expect(store.getState().network.fetching).toBeFalse();
		});

		it('regards pending responses when not resolved', async () => {
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			spyOn(window, 'fetch').and.callFake(async () => {
				throw new Error('oops');
			});

			try {
				await instanceUnderTest.fetch('first');
				throw new Error('Promise should not be resolved');
			} catch {
				expect(store.getState().network.fetching).toBeFalse();
			}
		});

		it('updates the store when fetch call fails', async () => {
			const url = 'http://foo.bar';
			const instanceUnderTest = new NetworkStateSyncHttpService();
			const store = setup();
			spyOn(window, 'fetch').and.callFake(() => {
				expect(store.getState().network.fetching).toBeTrue();
				return Promise.reject('something got wrong');
			});

			try {
				await instanceUnderTest.fetch(url);
				throw new Error('Promise should not be resolved');
			} catch {
				expect(store.getState().network.fetching).toBeFalse();
			}
		});
	});
});
