import { UrlService } from '../../src/services/UrlService';
import { $injector } from '../../src/injection';


describe('UrlService', () => {

	let instanceUnderTest;

	const httpService = {
		head: async () => { }
	};

	beforeAll(() => {
		$injector
			// .registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	beforeEach(() => {
		//we use mocked urlShortening and proxifyUrl provides
		instanceUnderTest = new UrlService(async () => 'https://much.shorter', (url) => 'https://proxified/' + url, (url) => 'https://qrcode/' + url);
	});

	describe('constructor', () => {
		it('sets default providers', async () => {
			const service = new UrlService();

			expect(service._proxifyUrlProvider).toBeDefined();
			expect(service._urlShorteningProvider).toBeDefined();
			expect(service._qrCodeUrlProvider).toBeDefined();
		});
	});

	describe('cors availability', () => {

		it('checks if cors is enabled (it is)', async () => {
			const expectedArgs0 = 'https://some.url';
			const expectedArgs1 = {
				timeout: 1500
			};
			const spy = spyOn(httpService, 'head').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve({
				ok: true
			}));

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalled();
			expect(result).toBeTrue();
		});

		it('checks if cors is enabled (it isn\'t)', async () => {
			const expectedArgs0 = 'https://some.url';
			const expectedArgs1 = {
				timeout: 1500
			};
			const spy = spyOn(httpService, 'head').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve({
				ok: false
			}));

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalled();
			expect(result).toBeFalse();
		});

		it('rejects when argument is not a string', async () => {

			try {
				await instanceUnderTest.isCorsEnabled(123);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toEqual(jasmine.any(TypeError));
				expect(error.message).toBe('Parameter \'url\' must be a string');
			}
		});
	});

	describe('proxify urls', () => {

		describe('instantly', () => {
			it('proxyfies a url instantly', () => {
				const url = 'https://some.url';

				const result = instanceUnderTest.proxifyInstant(url);

				expect(result).toBe('https://proxified/' + url);
			});

			it('rejects when argument is not a string', () => {

				expect(() => instanceUnderTest.proxifyInstant(123)).toThrowError(TypeError, /Parameter 'url' must be a string/);
			});
		});

		describe('on demand', () => {

			it('proxyfies a url with cors check (needs proxy)', async () => {
				const url = 'https://some.url';
				const httpServiceSpy = spyOn(httpService, 'head').and.returnValue(Promise.resolve({
					ok: false
				}));

				const result = await instanceUnderTest.proxify(url);

				expect(httpServiceSpy).toHaveBeenCalled();
				expect(result).toBe('https://proxified/' + url);
			});

			it('proxyfies a url with cors check (does not need proxy)', async () => {
				const url = 'https://some.url';
				const httpServiceSpy = spyOn(httpService, 'head').and.returnValue(Promise.resolve({
					ok: true
				}));

				const result = await instanceUnderTest.proxify(url);

				expect(httpServiceSpy).toHaveBeenCalled();
				expect(result).toBe(url);
			});

			it('rejects when argument is not a string', async () => {

				try {
					await instanceUnderTest.proxify(123);
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error).toEqual(jasmine.any(TypeError));
					expect(error.message).toBe('Parameter \'url\' must be a string');
				}
			});
		});
	});

	describe('shortens urls', () => {

		it('shortens urls by using a provider', async () => {
			const url = 'https://some.url';

			const result = await instanceUnderTest.shorten(url);

			expect(result).toBe('https://much.shorter');
		});

		it('rejects when argument is not a string', async () => {

			try {
				await instanceUnderTest.shorten(123);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toEqual(jasmine.any(TypeError));
				expect(error.message).toBe('Parameter \'url\' must be a string');
			}
		});
	});

	describe('qrCode URL', () => {

		it('returns qrCode URL by using a provider', () => {
			const url = 'https://some.url';

			const result = instanceUnderTest.qrCode(url);

			expect(result).toBe('https://qrcode/' + url);
		});

		it('throws an exception when argument is not a string', () => {

			expect(() => instanceUnderTest.qrCode(123)).toThrowError(Error, 'Parameter \'url\' must be a string');
		});
	});
});
