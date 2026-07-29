import { UrlService } from '@src/services/UrlService';
import { $injector } from '@src/injection';

describe('UrlService', () => {
	let instanceUnderTest;

	const httpService = {
		head: async () => {}
	};

	beforeAll(() => {
		$injector
			// .registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	beforeEach(() => {
		//we use mocked urlShortening and proxifyUrl provides
		instanceUnderTest = new UrlService(
			async () => 'https://much.shorter',
			(url) => 'https://proxified/' + url,
			(url) => 'https://qrcode/' + url
		);
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
			const spy = vi.spyOn(httpService, 'head').mockReturnValue(
				Promise.resolve({
					ok: true
				})
			);

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalledWith(expectedArgs0, expectedArgs1);
			expect(result).toBe(true);
		});

		it("checks if cors is enabled (it isn't)", async () => {
			const expectedArgs0 = 'https://some.url';
			const expectedArgs1 = {
				timeout: 1500
			};
			const spy = vi.spyOn(httpService, 'head').mockReturnValue(
				Promise.resolve({
					ok: false
				})
			);

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalledWith(expectedArgs0, expectedArgs1);
			expect(result).toBe(false);
		});

		it('rejects when argument  represents not  an URL', async () => {
			await expect(instanceUnderTest.isCorsEnabled('foo')).rejects.toThrowError(new TypeError("Parameter 'url' must represent an URL"));
		});
	});

	describe('proxify urls', () => {
		describe('instantly', () => {
			it('proxyfies an url instantly', () => {
				const url = 'https://some.url';

				const result = instanceUnderTest.proxifyInstant(url);

				expect(result).toBe('https://proxified/' + url);
			});

			describe('argument represents not an URL', () => {
				it('rejects in strict mode', () => {
					expect(() => instanceUnderTest.proxifyInstant('foo')).toThrowError(TypeError, /Parameter 'url' must represent an URL/);
				});

				it('returns the argument in non-strict-mode', () => {
					expect(instanceUnderTest.proxifyInstant('foo', false)).toBe('foo');
				});
			});
		});

		describe('on demand', () => {
			it('proxyfies an url with cors check (needs proxy)', async () => {
				const url = 'https://some.url';
				const httpServiceSpy = vi.spyOn(httpService, 'head').mockReturnValue(
					Promise.resolve({
						ok: false
					})
				);

				const result = await instanceUnderTest.proxify(url);

				expect(httpServiceSpy).toHaveBeenCalled();
				expect(result).toBe('https://proxified/' + url);
			});

			it('proxyfies an url with cors check (does not need proxy)', async () => {
				const url = 'https://some.url';
				const httpServiceSpy = vi.spyOn(httpService, 'head').mockReturnValue(
					Promise.resolve({
						ok: true
					})
				);

				const result = await instanceUnderTest.proxify(url);

				expect(httpServiceSpy).toHaveBeenCalled();
				expect(result).toBe(url);
			});

			describe('argument represents not an URL', () => {
				it('rejects in strict mode', async () => {
					await expect(instanceUnderTest.proxify('foo')).rejects.toThrowError(new TypeError("Parameter 'url' must represent an URL"));
				});

				it('returns the argument in non-strict-mode', async () => {
					await expect(instanceUnderTest.proxify('foo', false)).resolves.toBe('foo');
				});
			});
		});
	});

	describe('shortens urls', () => {
		it('shortens urls by using a provider', async () => {
			const url = 'https://some.url';

			const result = await instanceUnderTest.shorten(url);

			expect(result).toBe('https://much.shorter');
		});

		it('rejects when argument  represents not  an URL', async () => {
			await expect(instanceUnderTest.shorten('foo')).rejects.toThrowError(new TypeError("Parameter 'url' must represent an URL"));
		});
	});

	describe('qrCode URL', () => {
		it('returns qrCode URL by using a provider', () => {
			const url = 'https://some.url';

			const result = instanceUnderTest.qrCode(url);

			expect(result).toBe('https://qrcode/' + url);
		});

		it('throws an exception when argument  represents not  an URL', () => {
			expect(() => instanceUnderTest.qrCode('foo')).toThrowError(Error, "Parameter 'url' must represent an URL");
		});
	});
});
