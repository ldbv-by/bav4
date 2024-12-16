import { IconResult, IconService } from '../../src/services/IconService';
import { loadBvvIcons } from '../../src/services/provider/icons.provider';
import { getBvvIconColor } from '../../src/services/provider/iconColor.provider';
import { getBvvIconUrlFactory } from '../../src/services/provider/iconUrl.provider';
import { $injector } from '../../src/injection';

describe('IconsService', () => {
	const getMatcher = (id) => {
		return (idOrUrl) => idOrUrl === id || idOrUrl?.endsWith(id);
	};
	const iconResult1 = new IconResult('foo1', 'bar1', getMatcher('foo1'), () => 'http://some.url/foo1');
	const iconResult2 = new IconResult('foo2', 'bar2', getMatcher('foo2'), () => 'http://some.url/foo2');
	const markerIconResult = new IconResult('marker', 'marker', getMatcher('marker'), () => 'http://some.url/marker');
	const loadMockIcons = async () => {
		return [iconResult1, iconResult2];
	};

	const iconColorMock = () => [0, 0, 0];

	const iconUrlFactoryMock = () => {
		return (color) => `http://some.url/icons/${color[0]},${color[1]},${color[2]}/icon.png`;
	};

	const setup = (iconProvider = loadMockIcons, iconColorProvider = iconColorMock, iconUrlFactoryProvider = iconUrlFactoryMock) => {
		return new IconService(iconProvider, iconColorProvider, iconUrlFactoryProvider);
	};

	describe('initialization', () => {
		it('initializes the service', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._icons).toBeNull();

			const icons = await instanceUnderTest.all();
			const defaultIcon = instanceUnderTest.getDefault();

			expect(icons.length).toBe(3);
			expect(icons[0]).toEqual(defaultIcon);
		});

		it('initializes the service with default provider', async () => {
			const configServiceMock = {
				getValueAsPath: () => {}
			};
			$injector.registerSingleton('ConfigService', configServiceMock);
			const instanceUnderTest = new IconService();
			expect(instanceUnderTest._iconProvider).toEqual(loadBvvIcons);
			expect(instanceUnderTest._iconColorProvider).toEqual(getBvvIconColor);
			expect(instanceUnderTest._iconUrlFactoryProvider).toEqual(getBvvIconUrlFactory);
		});

		it('initializes the service with custom provider', async () => {
			const customIconProvider = async () => {};
			const customIconColorProvider = () => {};
			const customIconUrlProvider = async () => {};
			const instanceUnderTest = setup(customIconProvider, customIconColorProvider, customIconUrlProvider);
			expect(instanceUnderTest._iconProvider).toEqual(customIconProvider);
			expect(instanceUnderTest._iconColorProvider).toEqual(customIconColorProvider);
			expect(instanceUnderTest._iconUrlFactoryProvider).toEqual(customIconUrlProvider);
		});

		it('just provides the icons when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._icons = [iconResult1];

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {
			it('logs an error when we are NOT in standalone mode', async () => {
				const instanceUnderTest = setup(async () => {
					throw new Error('Icons could not be loaded');
				});
				const warnSpy = spyOn(console, 'warn');

				const icons = await instanceUnderTest.all();
				const defaultIcon = instanceUnderTest.getDefault();

				expect(icons.length).toBe(12);
				expect(icons[0]).toEqual(defaultIcon);
				expect(icons).toEqual(
					jasmine.arrayContaining([
						jasmine.objectContaining({ id: 'marker' }),
						jasmine.objectContaining({ id: 'triangle-stroked' }),
						jasmine.objectContaining({ id: 'triangle' }),
						jasmine.objectContaining({ id: 'square-stroked' }),
						jasmine.objectContaining({ id: 'square' }),
						jasmine.objectContaining({ id: 'rt_start' }),
						jasmine.objectContaining({ id: 'rt_destination' }),
						jasmine.objectContaining({ id: 'rt_intermediate' }),
						jasmine.objectContaining({ id: 'highlight_marker' }),
						jasmine.objectContaining({ id: 'highlight_default' }),
						jasmine.objectContaining({ id: 'highlight_marker_tmp' }),
						jasmine.objectContaining({ id: 'highlight_default_tmp' })
					])
				);
				expect(warnSpy).toHaveBeenCalledWith('Icons could not be fetched from backend. Using fallback icons ...');
			});

			it('provides fallback routing-icons with a specific url-matcher function', async () => {
				const instanceUnderTest = setup(async () => {
					throw new Error('Icons could not be loaded');
				});

				const icons = await instanceUnderTest.all();

				expect(icons.length).toBe(12);

				expect(instanceUnderTest.getIconResult('rt_start').matches('rt_start')).toBeTrue();
				expect(instanceUnderTest.getIconResult('rt_destination').matches('rt_destination')).toBeTrue();
				expect(instanceUnderTest.getIconResult('rt_intermediate').matches('rt_intermediate')).toBeTrue();

				expect(instanceUnderTest.getIconResult('highlight_marker').matches('highlight_marker')).toBeTrue();
				expect(instanceUnderTest.getIconResult('highlight_default').matches('highlight_default')).toBeTrue();
				expect(instanceUnderTest.getIconResult('highlight_marker_tmp').matches('highlight_marker_tmp')).toBeTrue();
				expect(instanceUnderTest.getIconResult('highlight_default_tmp').matches('highlight_default_tmp')).toBeTrue();
			});
		});
	});

	describe('all', () => {
		it('provides all icons', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._icons = [iconResult1];

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(1);
		});

		it('fetches the icons when service have not been initialized', async () => {
			const instanceUnderTest = setup(async () => {
				return Promise.resolve([iconResult1]);
			});
			const loadSpy = spyOn(instanceUnderTest, '_load').and.callThrough();

			const icons = await instanceUnderTest.all();
			expect(loadSpy).toHaveBeenCalled();
			expect(icons.length).toBe(2);
		});

		it('arranges the icons with the default icon first', async () => {
			const instanceUnderTest = setup(async () => {
				return Promise.resolve([iconResult1, markerIconResult, iconResult2]);
			});
			const loadSpy = spyOn(instanceUnderTest, '_load').and.callThrough();

			const icons = await instanceUnderTest.all();

			expect(loadSpy).toHaveBeenCalled();
			expect(icons.length).toBe(3);
			expect(icons[0]).toEqual(markerIconResult);
		});
	});

	describe('getIconResult', () => {
		it('provides a IconResult for a icon-id', async () => {
			const instanceUnderTest = setup();
			await instanceUnderTest.all();

			expect(instanceUnderTest.getIconResult('foo1')).toBe(iconResult1);
		});

		it('provides a IconResult for a base64-string', async () => {
			const instanceUnderTest = setup();
			await instanceUnderTest.all();

			expect(instanceUnderTest.getIconResult(iconResult2.base64)).toBe(iconResult2);
		});

		it('provides the default-IconResult for the base64-string', async () => {
			const instanceUnderTest = setup();
			await instanceUnderTest.all();

			const defaultIcon = instanceUnderTest.getDefault();

			expect(instanceUnderTest.getIconResult(defaultIcon.base64)).toBe(defaultIcon);
		});

		it('does NOT provide a IconResult for NULL, invalid or unknown', async () => {
			const instanceUnderTest = setup();
			await instanceUnderTest.all();

			expect(instanceUnderTest.getIconResult(null)).toBeNull();
			expect(instanceUnderTest.getIconResult(undefined)).toBeNull();
			expect(instanceUnderTest.getIconResult('unknownId')).toBeNull();
			expect(instanceUnderTest.getIconResult('data:image/svg+xml;base64,unknownBase64')).toBeNull();
		});
	});

	describe('getDefault', () => {
		it('provides a default icon', async () => {
			const instanceUnderTest = setup();
			const defaultIcon = instanceUnderTest.getDefault();

			expect(defaultIcon).toBeInstanceOf(IconResult);
			expect(defaultIcon.id).toBe('marker');
			expect(defaultIcon.getUrl([1, 2, 3])).toBe('http://some.url/icons/1,2,3/icon.png');
		});
	});

	describe('decodeColor', () => {
		it('calls the iconColorProvider', () => {
			const instanceUnderTest = setup();
			const iconColorProviderSpy = spyOn(instanceUnderTest, '_iconColorProvider');

			instanceUnderTest.decodeColor('some.url');
			expect(iconColorProviderSpy).toHaveBeenCalled();
		});
	});

	describe('IconResult', () => {
		const fromBase64 = (id, encodedString) => {
			if (encodedString.startsWith('data:image/svg+xml;base64,')) {
				const b64DecodeUnicode = (str) => {
					return decodeURIComponent(
						window
							.atob(str)
							.split('')
							.map(function (c) {
								return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
							})
							.join('')
					);
				};

				return new IconResult(id, b64DecodeUnicode(encodedString.replace('data:image/svg+xml;base64,', '')));
			}
			return null;
		};

		it('uses default values, when not given', () => {
			const iconResult = new IconResult('foo', 'bar');

			expect(iconResult.matches('somethingWithfoo')).toBeFalse();
			expect(iconResult.getUrl()).toBeNull();
			expect(iconResult.isMonochrome).toBeTrue();
		});

		it('provides a defined anchor', () => {
			expect(new IconResult('marker', 'bar').anchor).toEqual([0.5, 1]);
			expect(new IconResult('anyOther', 'bar').anchor).toEqual([0.5, 0.5]);
			expect(new IconResult('some', 'bar').anchor).toEqual([0.5, 0.5]);
			expect(new IconResult('', 'bar').anchor).toEqual([0.5, 0.5]);
			expect(new IconResult(null, 'bar').anchor).toEqual([0.5, 0.5]);
		});

		it('creates a base64-encoded string and back', () => {
			const svg =
				'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><!-- MIT License --><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>';

			const firstIconResult = new IconResult('foo', svg);
			const base64String = firstIconResult.base64;

			const secondIconResult = fromBase64('bar', base64String);
			expect(base64String).toBeTruthy();
			expect(secondIconResult.svg).toEqual(firstIconResult.svg);
		});
	});
});
