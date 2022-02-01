import { IconResult, IconService } from '../../src/services/IconService';
import { loadBvvIcons } from '../../src/services/provider/icons.provider';
import { $injector } from '../../src/injection';
import { getBvvIconColor } from '../../src/services/provider/iconColor.provider';


describe('IconsService', () => {

	const configServiceMock = {
		getValue: () => { },
		getValueAsPath: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configServiceMock);
	});

	const getMatcher = (id) => {
		return (idOrUrl) => idOrUrl === id || idOrUrl.endsWith(id);
	};
	const iconResult1 = new IconResult('foo1', 'bar1', getMatcher('foo1'), () => 'http://some.url/foo1');
	const iconResult2 = new IconResult('foo2', 'bar2', getMatcher('foo2'), () => 'http://some.url/foo2');
	const markerIconResult = new IconResult('marker', 'marker', getMatcher('marker'), () => 'http://some.url/marker');
	const loadMockIcons = async () => {
		return [
			iconResult1,
			iconResult2
		];
	};


	const setup = (iconProvider = loadMockIcons) => {
		return new IconService(iconProvider);
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
			const instanceUnderTest = new IconService();
			expect(instanceUnderTest._iconProvider).toEqual(loadBvvIcons);
			expect(instanceUnderTest._iconColorProvider).toEqual(getBvvIconColor);
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
				const errorSpy = spyOn(console, 'warn');


				const icons = await instanceUnderTest.all();
				const defaultIcon = instanceUnderTest.getDefault();

				expect(icons.length).toBe(5);
				expect(icons[0]).toEqual(defaultIcon);
				expect(icons).toEqual(jasmine.arrayContaining([
					jasmine.objectContaining({ id: 'marker' }),
					jasmine.objectContaining({ id: 'triangle-stroked' }),
					jasmine.objectContaining({ id: 'triangle' }),
					jasmine.objectContaining({ id: 'square-stroked' }),
					jasmine.objectContaining({ id: 'square' })
				]));
				expect(errorSpy).toHaveBeenCalledWith('Icons could not be fetched from backend.', jasmine.anything());
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
	});

	describe('getDefault', () => {
		it('provides a default icon', async () => {
			const instanceUnderTest = setup();
			spyOn(configServiceMock, 'getValueAsPath').and.callFake(() => 'http://some.url/');
			const defaultIcon = instanceUnderTest.getDefault();

			expect(defaultIcon).toBeInstanceOf(IconResult);
			expect(defaultIcon.id).toBe('marker');
			expect(defaultIcon.getUrl([1, 2, 3])).toBe('http://some.url/icons/1,2,3/marker');

		});

		it('provides a default icon, without url', async () => {
			spyOn(configServiceMock, 'getValueAsPath').and.throwError('something');
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');
			const defaultIcon = instanceUnderTest.getDefault();


			expect(defaultIcon.getUrl([1, 2, 3])).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith('No backend-information available.');

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
					return decodeURIComponent(window.atob(str).split('').map(function (c) {
						return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
					}).join(''));
				};

				return new IconResult(id, b64DecodeUnicode(encodedString.replace('data:image/svg+xml;base64,', '')));
			}
			return null;
		};

		it('uses default urlProvider, when not given', () => {
			const iconResult = new IconResult('foo', 'bar');

			expect(iconResult.matches('somethingWithfoo')).toBeFalse();
			expect(iconResult.getUrl()).toBeNull();
		});

		it('creates a base64-encoded string and back', () => {
			const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><!-- MIT License --><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>';

			const firstIconResult = new IconResult('foo', svg);
			const base64String = firstIconResult.base64;

			const secondIconResult = fromBase64('bar', base64String);
			expect(base64String).toBeTruthy();
			expect(secondIconResult.svg).toEqual(firstIconResult.svg);
		});
	});
});

