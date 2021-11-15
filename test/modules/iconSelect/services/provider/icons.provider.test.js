import { $injector } from '../../../../../src/injection';
import { loadBvvIcons } from '../../../../../src/modules/iconSelect/services/provider/icons.provider';

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
				JSON.stringify([
					{ name: 'marker', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><!-- MIT License --><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>' },
					{ name: 'triangle-stroked', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgb(255,255,255)" class="bi bi-triangle" viewBox="0 0 16 16"><!-- MIT License --><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/></svg>' },
					{ name: 'triangle', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgb(255,255,255)" class="bi bi-triangle-fill" viewBox="0 0 16 16"><!-- MIT License --><path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/></svg > ' }]
				)
			)));

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
