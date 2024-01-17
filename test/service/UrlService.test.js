import { UrlService } from '../../src/services/UrlService';
import { $injector } from '../../src/injection';

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
			const spy = spyOn(httpService, 'head')
				.withArgs(expectedArgs0, expectedArgs1)
				.and.returnValue(
					Promise.resolve({
						ok: true
					})
				);

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalled();
			expect(result).toBeTrue();
		});

		it("checks if cors is enabled (it isn't)", async () => {
			const expectedArgs0 = 'https://some.url';
			const expectedArgs1 = {
				timeout: 1500
			};
			const spy = spyOn(httpService, 'head')
				.withArgs(expectedArgs0, expectedArgs1)
				.and.returnValue(
					Promise.resolve({
						ok: false
					})
				);

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalled();
			expect(result).toBeFalse();
		});

		it('rejects when argument  represents not  an URL', async () => {
			await expectAsync(instanceUnderTest.isCorsEnabled('foo')).toBeRejectedWithError(TypeError, "Parameter 'url' must represent an URL");
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
				const httpServiceSpy = spyOn(httpService, 'head').and.returnValue(
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
				const httpServiceSpy = spyOn(httpService, 'head').and.returnValue(
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
					await expectAsync(instanceUnderTest.proxify('foo')).toBeRejectedWithError(TypeError, "Parameter 'url' must represent an URL");
				});

				it('returns the argument in non-strict-mode', async () => {
					await expectAsync(instanceUnderTest.proxify('foo', false)).toBeResolvedTo('foo');
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
			await expectAsync(instanceUnderTest.shorten('foo')).toBeRejectedWithError(TypeError, "Parameter 'url' must represent an URL");
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

	describe('originAndPathname', () => {
		it('extracts the origin following by the pathname of an URL', () => {
			expect(instanceUnderTest.originAndPathname('http://foo.bar')).toBe('http://foo.bar');
			expect(instanceUnderTest.originAndPathname('http://foo.bar/?=')).toBe('http://foo.bar');
			expect(instanceUnderTest.originAndPathname('http://foo.bar/?foo=bar')).toBe('http://foo.bar');
			expect(instanceUnderTest.originAndPathname('http://foo.bar:1234/?foo=bar')).toBe('http://foo.bar:1234');
			expect(instanceUnderTest.originAndPathname('http://foo.bar/some')).toBe('http://foo.bar/some');
			expect(instanceUnderTest.originAndPathname('http://foo.bar/some/')).toBe('http://foo.bar/some/');
			expect(instanceUnderTest.originAndPathname('http://foo.bar/some/?=')).toBe('http://foo.bar/some/');
			expect(instanceUnderTest.originAndPathname('http://foo.bar/some?foo=bar')).toBe('http://foo.bar/some');
			expect(instanceUnderTest.originAndPathname('http://foo.bar:1234/some/?foo=bar')).toBe('http://foo.bar:1234/some/');
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => instanceUnderTest.originAndPathname('foo')).toThrowError(TypeError);
		});
	});

	describe('origin', () => {
		it('extracts the origin of an URL', () => {
			expect(instanceUnderTest.origin('http://foo.bar')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar/?=')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar/?foo=bar')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar:1234/?foo=bar')).toBe('http://foo.bar:1234');
			expect(instanceUnderTest.origin('http://foo.bar/some')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar/some/')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar/some/?=')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar/some/?foo=bar')).toBe('http://foo.bar');
			expect(instanceUnderTest.origin('http://foo.bar:1234/some/?foo=bar')).toBe('http://foo.bar:1234');
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => instanceUnderTest.origin('foo')).toThrowError(TypeError);
		});
	});

	describe('pathParams', () => {
		it('extracts the path parameters of an URL', () => {
			expect(instanceUnderTest.pathParams('http://foo.bar')).toEqual([]);
			expect(instanceUnderTest.pathParams('http://foo.bar/')).toEqual([]);
			expect(instanceUnderTest.pathParams('http://foo.bar/?=')).toEqual([]);
			expect(instanceUnderTest.pathParams('http://foo.bar/?foo=bar')).toEqual([]);
			expect(instanceUnderTest.pathParams('http://foo.bar:1234/?foo=bar')).toEqual([]);
			expect(instanceUnderTest.pathParams('http://foo.bar/some')).toEqual(['some']);
			expect(instanceUnderTest.pathParams('http://foo.bar/some/thing')).toEqual(['some', 'thing']);
			expect(instanceUnderTest.pathParams('http://foo.bar/some//thing')).toEqual(['some', 'thing']);
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => instanceUnderTest.pathParams('foo')).toThrowError(TypeError);
		});
	});
});
