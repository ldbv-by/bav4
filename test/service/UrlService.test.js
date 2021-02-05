import { UrlService } from '../../src/services/UrlService';
import { $injector } from '../../src/injection';


describe('UrlService', () => {

	let instanceUnderTest;
	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		fetch: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	beforeEach(() => {
		instanceUnderTest = new UrlService();
	});

	describe('cors availability', () => {

		it('checks if cors is enabled (it is)', async () => {
			const expectedArgs0 = 'https://some.url';
			const expectedArgs1 = {
				timeout: 1500,
				method: 'HEAD',
				mode: 'cors'
			};
			const spy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve({
				ok: true
			}));

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalled();
			expect(result).toBeTrue();
		});

		it('checks if cors is enabled (it isn\'t)', async () => {
			const expectedArgs0 = 'https://some.url';
			const expectedArgs1 = {
				timeout: 1500,
				method: 'HEAD',
				mode: 'cors'
			};
			const spy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve({
				ok: false
			}));

			const result = await instanceUnderTest.isCorsEnabled('https://some.url');

			expect(spy).toHaveBeenCalled();
			expect(result).toBeFalse();
		});
	});

	describe('proxify urls', () => {
		it('proxyfies a url instant', async () => {
			const url = 'https://some.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('PROXY_URL').and.returnValue('https://proxy.url');

			const result = await instanceUnderTest.proxifyInstant(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(result).toBe('https://proxy.url?' + encodeURIComponent(url));
		});

		it('proxyfies a url with cors check (needs proxy)', async () => {
			const url = 'https://some.url';
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				ok: false
			}));
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('PROXY_URL').and.returnValue('https://proxy.url');

			const result = await instanceUnderTest.proxify(url);

			expect(httpServiceSpy).toHaveBeenCalled();
			expect(configServiceSpy).toHaveBeenCalled();
			expect(result).toBe('https://proxy.url?' + encodeURIComponent(url));
		});

		it('proxyfies a url with cors check (does not need proxy)', async () => {
			const url = 'https://some.url';
			const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve({
				ok: true
			}));
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('PROXY_URL').and.returnValue('https://proxy.url');

			const result = await instanceUnderTest.proxify(url);

			expect(httpServiceSpy).toHaveBeenCalled();
			expect(configServiceSpy).not.toHaveBeenCalled();
			expect(result).toBe(url);
		});
	});
});