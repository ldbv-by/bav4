import { HttpService } from '../../src/utils/HttpService';



describe('HttpService', () => {

	beforeEach(function () {
		jasmine.clock().install();
	});

	afterEach(function () {
		jasmine.clock().uninstall();
	});

	it('provides a result', async () => {
		const httpService = new HttpService();
		const spy = spyOn(window, 'fetch').and.returnValue(Promise.resolve({
			text: () => {
				return 42;
			}
		}));

		const results = await httpService.fetch('something');

		expect(spy).toHaveBeenCalled();
		expect(results.text()).toBe(42);
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

		const results = await httpService.fetch('something', { timeout: 3000 });

		expect(fetchSpy).toHaveBeenCalled();
		expect(results.text()).toBe(42);
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