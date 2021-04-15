import { HttpService } from '../../src/services/HttpService';



describe('HttpService', () => {

	beforeEach(function () {
		jasmine.clock().install();
	});

	afterEach(function () {
		jasmine.clock().uninstall();
	});

	describe('fetch', () => {

		it('provides a result', async () => {
			const httpService = new HttpService();
			const spy = spyOn(window, 'fetch').and.returnValue(Promise.resolve({
				text: () => {
					return 42;
				}
			}));

			const result = await httpService.fetch('something');

			expect(spy).toHaveBeenCalled();
			expect(result.text()).toBe(42);
		});

		it('provides a result with customized timeout ', async () => {
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

			const result = await httpService.fetch('something', { timeout: 3000 });

			expect(fetchSpy).toHaveBeenCalled();
			expect(result.text()).toBe(42);
		});

		it('aborts the request when default timeout limit is exceeded', async () => {
			const httpService = new HttpService();

			const controller = new AbortController();
			const controllerSpy = spyOn(controller, 'abort');
			const fetchSpy = spyOn(window, 'fetch').and.callFake(() => {
				// we wait 2000ms in order to exceed the default timeout limit
				jasmine.clock().tick(2000);
			});

			await httpService.fetch('something', {}, controller);

			expect(fetchSpy).toHaveBeenCalled();
			expect(controllerSpy).toHaveBeenCalled();
		});
	});

	describe('get', () => {

		it('provides a result with default options', async () => {
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				text: () => {
					return 42;
				}
			}));


			const result = await httpService.get('something');

			expect(spy).toHaveBeenCalledWith('something', { mode: 'cors' });
			expect(result.text()).toBe(42);
		});

		it('provides a result with custom options', async () => {
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				text: () => {
					return 42;
				}
			}));


			const result = await httpService.get('something', { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith('something', { mode: 'cors', timeout: 2000 });
			expect(result.text()).toBe(42);
		});

	});

	describe('post', () => {

		it('post data and provides a result with default options', async () => {
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				text: () => {
					return 42;
				}
			}));

			const result = await httpService.post('something', 'someData', 'someContentType');

			expect(spy).toHaveBeenCalledWith('something', {
				method: 'POST',
				body: 'someData',
				mode: 'cors',
				headers: {
					'Content-Type': 'someContentType'
				}
			});
			expect(result.text()).toBe(42);
		});

		it('post data and provides a result with custom options', async () => {
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				text: () => {
					return 42;
				}
			}));

			const result = await httpService.post('something', 'someData', 'someContentType', { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith('something', {
				method: 'POST',
				body: 'someData',
				mode: 'cors',
				timeout: 2000,
				headers: {
					'Content-Type': 'someContentType'
				}
			});
			expect(result.text()).toBe(42);
		});
	});

	describe('head', () => {

		it('provides a result with default options', async () => {
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				ok: true
			}));

			const result = await httpService.head('something');

			expect(spy).toHaveBeenCalledWith('something', {
				method: 'HEAD',
				mode: 'cors'
			});
			expect(result.ok).toBeTrue();
		});

		it('provides a result with custom options', async () => {
			const httpService = new HttpService();
			const spy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				ok: true
			}));


			const result = await httpService.head('something', { timeout: 2000 });

			expect(spy).toHaveBeenCalledWith('something', {
				method: 'HEAD',
				mode: 'cors',
				timeout: 2000
			});
			expect(result.ok).toBeTrue();
		});

	});
});