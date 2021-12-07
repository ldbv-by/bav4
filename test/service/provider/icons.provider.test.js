import { $injector } from '../../../src/injection';
import { IconResult } from '../../../src/services/IconService';
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

		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'foo2', svg: '<svg>bar2</svg>' },
			{ id: 'foo3', svg: '<svg>bar3</svg>' }]
		);
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(payload)));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(3);

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(jasmine.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBeTrue();
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1')).toBeTrue();
		expect(fooIconResult1.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult1.getUrl([0, 0, 0])).toBe('https://backend.url/icons/0,0,0/foo1');
	});

	it('warns when backend have not icons', async () => {

		const backendUrl = 'https://backend.url';
		const payload = JSON.stringify([]);
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const warnSpy = spyOn(console, 'warn');
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(payload)));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith('The backend provides no icons');
		expect(icons.length).toBe(0);

	});


	it('rejects when backend request cannot be fulfilled', async () => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));

		try {
			await loadBvvIcons();
			throw new Error('Promise should not be resolved');
		}
		catch (error) {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(error.message).toBe('Icons could not be retrieved');
		}
	});
});
