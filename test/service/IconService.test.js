import { IconResult, IconService } from '../../src/services/IconService';
import { loadBvvIcons } from '../../src/services/provider/icons.provider';
import { $injector } from '../../src/injection';


describe('IconsService', () => {

	const configService = {
		getValue: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});

	const iconResult1 = new IconResult('foo1', 'bar1');
	const iconResult2 = new IconResult('foo2', 'bar2');
	const markerIconResult = new IconResult('marker', 'marker');
	const loadMockIcons = async () => {
		return [
			iconResult1,
			iconResult2
		];
	};

	const getIconsUrlMock = (id, color) => {
		return `backend.url/${color}/${id}`;
	};

	const setup = (iconProvider = loadMockIcons, iconUrlProvider = getIconsUrlMock) => {
		return new IconService(iconProvider, iconUrlProvider);
	};

	describe('initialization', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._icons).toBeNull();

			const icons = await instanceUnderTest.all();
			const defaultIcon = instanceUnderTest.default();

			expect(icons.length).toBe(3);
			expect(icons[0]).toEqual(defaultIcon);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new IconService();
			expect(instanceUnderTest._iconProvider).toEqual(loadBvvIcons);
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
				const defaultIcon = instanceUnderTest.default();

				expect(icons.length).toBe(6);
				expect(icons[0]).toEqual(defaultIcon);
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

	describe('getUrl', () => {
		const color = [42, 12, 55];
		it('provides a url for a icon-id and color', async () => {
			const instanceUnderTest = setup();
			const id = 'foo';

			const url = await instanceUnderTest.getUrl(id, color);

			expect(url).toBe('backend.url/42,12,55/foo');
		});

		it('provides a url for a base64String and color', async () => {
			const instanceUnderTest = setup(async () => {
				return Promise.resolve([iconResult1, markerIconResult, iconResult2]);
			});
			const base64String = iconResult2.base64;

			const url = await instanceUnderTest.getUrl(base64String, color);

			expect(url).toBe('backend.url/42,12,55/foo2');
		});
	});

	describe('default', () => {
		it('provides a default icon', async () => {
			const instanceUnderTest = setup();

			const defaultIcon = instanceUnderTest.default();

			expect(defaultIcon).toBeInstanceOf(IconResult);
			expect(defaultIcon.id).toBe('marker');
		});
	});

	describe('fromBase64', () => {
		it('creates nothing when input is invalid content', () => {
			const invalidInput = 'something';

			const instanceUnderTest = setup();

			expect(instanceUnderTest.fromBase64('bar', invalidInput)).toBeNull();
		});
	});

	describe('IconResult', () => {

		it('creates a base64-encoded string and back', () => {
			const instanceUnderTest = setup();
			const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><!-- MIT License --><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>';

			const firstIconResult = new IconResult('foo', svg);
			const base64String = firstIconResult.base64;

			const secondIconResult = instanceUnderTest.fromBase64('bar', base64String);
			expect(base64String).toBeTruthy();
			expect(secondIconResult.svg).toEqual(firstIconResult.svg);
		});
	});
});

