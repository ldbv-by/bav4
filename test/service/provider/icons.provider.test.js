import { $injector } from '../../../src/injection';
import { IconResult } from '../../../src/services/IconService';
import { loadBvvIcons } from '../../../src/services/provider/icons.provider';

describe('Icons provider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	it('loads icons', async () => {
		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'foo2', svg: '<svg>bar2</svg>' },
			{ id: 'foo3', svg: '<svg>bar3</svg>' }
		]);
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(payload)));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(3);

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(jasmine.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBeTrue();
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1.png')).toBeTrue();
		expect(fooIconResult1.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult1.matches(null)).toBeFalse();
		expect(fooIconResult1.getUrl([0, 0, 0])).toBe('https://backend.url/icons/0,0,0/foo1.png');
	});

	it('loads icons, replaces routing icons with specified IconResults', async () => {
		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'rt_start' },
			{ id: 'rt_destination' },
			{ id: 'misconfigured_icon', svg: null }
		]);
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(payload)));
		const warnSpy = spyOn(console, 'warn');
		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(3);

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(jasmine.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBeTrue();
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1.png')).toBeTrue();
		expect(fooIconResult1.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult1.matches(null)).toBeFalse();
		expect(fooIconResult1.getUrl([0, 0, 0])).toBe('https://backend.url/icons/0,0,0/foo1.png');
		const fooIconResult2 = icons[1];
		expect(fooIconResult2).toEqual(jasmine.any(IconResult));
		expect(fooIconResult2.matches('rt_start')).toBeTrue();
		expect(fooIconResult2.matches('https://backend.url/icons/rt_start.png')).toBeTrue();
		expect(fooIconResult2.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult2.matches(null)).toBeFalse();
		expect(fooIconResult2.getUrl([0, 0, 0])).toBe('https://backend.url/icons/rt_start.png');
		const fooIconResult3 = icons[2];
		expect(fooIconResult3).toEqual(jasmine.any(IconResult));
		expect(fooIconResult3.matches('rt_destination')).toBeTrue();
		expect(fooIconResult3.matches('https://backend.url/icons/rt_destination.png')).toBeTrue();
		expect(fooIconResult3.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult3.matches(null)).toBeFalse();
		expect(fooIconResult3.getUrl([0, 0, 0])).toBe('https://backend.url/icons/rt_destination.png');

		expect(icons.find((iconResult) => iconResult.id === 'misconfigured_icon')).toBeUndefined();
		expect(icons.find((iconResult) => iconResult.id === 'rt_intermediate')).toBeUndefined();

		expect(warnSpy).toHaveBeenCalledOnceWith("Could not find or replace a svg resource for icon 'misconfigured_icon'");
	});

	it('finds by ID in loaded icons', async () => {
		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'foo2', svg: '<svg>bar2</svg>' },
			{ id: 'foo3', svg: '<svg>bar3</svg>' }
		]);
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(payload)));

		const icons = await loadBvvIcons();

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(jasmine.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBeTrue();
		expect(fooIconResult1.matches('somethingWrong')).toBeFalse();
	});

	it('finds by URL in loaded icons', async () => {
		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'foo2', svg: '<svg>bar2</svg>' },
			{ id: 'foo3', svg: '<svg>bar3</svg>' }
		]);
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(payload)));

		const icons = await loadBvvIcons();

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(jasmine.any(IconResult));
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1.png')).toBeTrue();
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/some-foo1')).toBeFalse();
	});

	it('warns when backend does not have icons', async () => {
		const backendUrl = 'https://backend.url';
		const payload = JSON.stringify([]);
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const warnSpy = spyOn(console, 'warn');
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(payload)));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith('The backend provides no icons');
		expect(icons.length).toBe(0);
	});

	it('rejects when backend request cannot be fulfilled', async () => {
		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

		try {
			await loadBvvIcons();
			throw new Error('Promise should not be resolved');
		} catch (error) {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(error.message).toBe('Icons could not be retrieved');
		}
	});
});
