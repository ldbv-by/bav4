import { $injector } from '../../../src/injection';
import { loadBvvIcons } from '../../../src/services/provider/icons.provider';

describe('Icons provider', () => {

	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		get: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	it('loads icons', async () => {

		const backendUrl = 'https://backend.url';

		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(
				JSON.stringify(['foo', 'bar', 'baz'])
			)
		));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(3);

		const fooIconTemplateUrl = icons[0];
		expect(fooIconTemplateUrl()).toBe('https://backend.url/icons/0,0,0/foo');

		const barIconTemplateUrl = icons[1];
		expect(barIconTemplateUrl()).toBe('https://backend.url/icons/0,0,0/bar');
		expect(barIconTemplateUrl(10, 20, 30)).toBe('https://backend.url/icons/10,20,30/bar');
	});

	it('rejects when backend request cannot be fulfilled', (done) => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));


		loadBvvIcons().then(() => {
			done(new Error('Promise should not be resolved'));
		}, (reason) => {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(reason.message).toBe('Icons could not be retrieved');
			done();
		});

	});
});
