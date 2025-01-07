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
			{ id: 'highlight_marker' },
			{ id: 'highlight_default' },
			{ id: 'highlight_default_tmp' },
			{ id: 'highlight_marker_tmp' },
			{ id: 'misconfigured_icon', svg: null }
		]);
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(payload)));
		const warnSpy = spyOn(console, 'warn');
		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(7);

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
		const fooIconResult4 = icons[3];
		expect(fooIconResult4).toEqual(jasmine.any(IconResult));
		expect(fooIconResult4.matches('highlight_marker')).toBeTrue();
		expect(fooIconResult4.matches('https://backend.url/icons/highlight_marker.png')).toBeTrue();
		expect(fooIconResult4.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult4.matches(null)).toBeFalse();
		expect(fooIconResult4.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_marker.png');
		const fooIconResult5 = icons[4];
		expect(fooIconResult5).toEqual(jasmine.any(IconResult));
		expect(fooIconResult5.matches('highlight_default')).toBeTrue();
		expect(fooIconResult5.matches('https://backend.url/icons/highlight_default.png')).toBeTrue();
		expect(fooIconResult5.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult5.matches(null)).toBeFalse();
		expect(fooIconResult5.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_default.png');
		const fooIconResult6 = icons[5];
		expect(fooIconResult6).toEqual(jasmine.any(IconResult));
		expect(fooIconResult6.matches('highlight_default_tmp')).toBeTrue();
		expect(fooIconResult6.matches('https://backend.url/icons/highlight_default_tmp.png')).toBeTrue();
		expect(fooIconResult6.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult6.matches(null)).toBeFalse();
		expect(fooIconResult6.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_default_tmp.png');
		const fooIconResult7 = icons[6];
		expect(fooIconResult7).toEqual(jasmine.any(IconResult));
		expect(fooIconResult7.matches('highlight_marker_tmp')).toBeTrue();
		expect(fooIconResult7.matches('https://backend.url/icons/highlight_marker_tmp.png')).toBeTrue();
		expect(fooIconResult7.matches('somethingWrong')).toBeFalse();
		expect(fooIconResult7.matches(null)).toBeFalse();
		expect(fooIconResult7.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_marker_tmp.png');

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
