import { $injector } from '@src/injection';
import { IconResult } from '@src/services/IconService';
import { loadBvvIcons } from '@src/services/provider/icons.provider';

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
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(payload));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(3);

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(expect.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBe(true);
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1.png')).toBe(true);
		expect(fooIconResult1.matches('somethingWrong')).toBe(false);
		expect(fooIconResult1.matches(null)).toBe(false);
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
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(payload));
		const warnSpy = vi.spyOn(console, 'warn');
		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(icons.length).toBe(7);

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(expect.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBe(true);
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1.png')).toBe(true);
		expect(fooIconResult1.matches('somethingWrong')).toBe(false);
		expect(fooIconResult1.matches(null)).toBe(false);
		expect(fooIconResult1.getUrl([0, 0, 0])).toBe('https://backend.url/icons/0,0,0/foo1.png');
		const fooIconResult2 = icons[1];
		expect(fooIconResult2).toEqual(expect.any(IconResult));
		expect(fooIconResult2.matches('rt_start')).toBe(true);
		expect(fooIconResult2.matches('https://backend.url/icons/rt_start.png')).toBe(true);
		expect(fooIconResult2.matches('somethingWrong')).toBe(false);
		expect(fooIconResult2.matches(null)).toBe(false);
		expect(fooIconResult2.getUrl([0, 0, 0])).toBe('https://backend.url/icons/rt_start.png');
		const fooIconResult3 = icons[2];
		expect(fooIconResult3).toEqual(expect.any(IconResult));
		expect(fooIconResult3.matches('rt_destination')).toBe(true);
		expect(fooIconResult3.matches('https://backend.url/icons/rt_destination.png')).toBe(true);
		expect(fooIconResult3.matches('somethingWrong')).toBe(false);
		expect(fooIconResult3.matches(null)).toBe(false);
		expect(fooIconResult3.getUrl([0, 0, 0])).toBe('https://backend.url/icons/rt_destination.png');
		const fooIconResult4 = icons[3];
		expect(fooIconResult4).toEqual(expect.any(IconResult));
		expect(fooIconResult4.matches('highlight_marker')).toBe(true);
		expect(fooIconResult4.matches('https://backend.url/icons/highlight_marker.png')).toBe(true);
		expect(fooIconResult4.matches('somethingWrong')).toBe(false);
		expect(fooIconResult4.matches(null)).toBe(false);
		expect(fooIconResult4.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_marker.png');
		const fooIconResult5 = icons[4];
		expect(fooIconResult5).toEqual(expect.any(IconResult));
		expect(fooIconResult5.matches('highlight_default')).toBe(true);
		expect(fooIconResult5.matches('https://backend.url/icons/highlight_default.png')).toBe(true);
		expect(fooIconResult5.matches('somethingWrong')).toBe(false);
		expect(fooIconResult5.matches(null)).toBe(false);
		expect(fooIconResult5.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_default.png');
		const fooIconResult6 = icons[5];
		expect(fooIconResult6).toEqual(expect.any(IconResult));
		expect(fooIconResult6.matches('highlight_default_tmp')).toBe(true);
		expect(fooIconResult6.matches('https://backend.url/icons/highlight_default_tmp.png')).toBe(true);
		expect(fooIconResult6.matches('somethingWrong')).toBe(false);
		expect(fooIconResult6.matches(null)).toBe(false);
		expect(fooIconResult6.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_default_tmp.png');
		const fooIconResult7 = icons[6];
		expect(fooIconResult7).toEqual(expect.any(IconResult));
		expect(fooIconResult7.matches('highlight_marker_tmp')).toBe(true);
		expect(fooIconResult7.matches('https://backend.url/icons/highlight_marker_tmp.png')).toBe(true);
		expect(fooIconResult7.matches('somethingWrong')).toBe(false);
		expect(fooIconResult7.matches(null)).toBe(false);
		expect(fooIconResult7.getUrl([0, 0, 0])).toBe('https://backend.url/icons/highlight_marker_tmp.png');

		expect(icons.find((iconResult) => iconResult.id === 'misconfigured_icon')).toBeUndefined();
		expect(icons.find((iconResult) => iconResult.id === 'rt_intermediate')).toBeUndefined();

		expect(warnSpy).toHaveBeenCalledWith("Could not find or replace a svg resource for icon 'misconfigured_icon'");
	});

	it('finds by ID in loaded icons', async () => {
		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'foo2', svg: '<svg>bar2</svg>' },
			{ id: 'foo3', svg: '<svg>bar3</svg>' }
		]);
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		vi.spyOn(httpService, 'get').mockResolvedValue(new Response(payload));

		const icons = await loadBvvIcons();

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(expect.any(IconResult));
		expect(fooIconResult1.matches('foo1')).toBe(true);
		expect(fooIconResult1.matches('somethingWrong')).toBe(false);
	});

	it('finds by URL in loaded icons', async () => {
		const backendUrl = 'https://backend.url/';
		const payload = JSON.stringify([
			{ id: 'foo1', svg: '<svg>bar1</svg>' },
			{ id: 'foo2', svg: '<svg>bar2</svg>' },
			{ id: 'foo3', svg: '<svg>bar3</svg>' }
		]);
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		vi.spyOn(httpService, 'get').mockResolvedValue(new Response(payload));

		const icons = await loadBvvIcons();

		const fooIconResult1 = icons[0];
		expect(fooIconResult1).toEqual(expect.any(IconResult));
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/foo1.png')).toBe(true);
		expect(fooIconResult1.matches('https://backend.url/icons/0,0,0/some-foo1')).toBe(false);
	});

	it('warns when backend does not have icons', async () => {
		const backendUrl = 'https://backend.url';
		const payload = JSON.stringify([]);
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const warnSpy = vi.spyOn(console, 'warn');
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(payload));

		const icons = await loadBvvIcons();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith('The backend provides no icons');
		expect(icons.length).toBe(0);
	});

	it('rejects when backend request cannot be fulfilled', async () => {
		const backendUrl = 'https://backend.url';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 404 }));

		expect(loadBvvIcons()).rejects.toThrow('Icons could not be retrieved');
		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});
});
