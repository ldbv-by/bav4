import { $injector } from '../../../src/injection';
import { bvvProxifyUrlProvider } from '../../../src/services/provider/proxifyUrl.provider';

describe('proxyUrlTemplate', () => {

	describe('bvv proxified url provider', () => {

		const configService = {
			getValueAsPath: () => 'https://proxy.url'
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService);
		});

		it('returns BVV specific proxifiedUrl', () => {
			const proxifiedUrl = bvvProxifyUrlProvider('https://some.one');

			expect(proxifiedUrl).toBe('https://proxy.url?url=https%3A%2F%2Fsome.one');
		});

		describe('when config param PROXY_URL is not available', () => {

			it('it returns the the unproxified url and logs a warn statement', () => {
				const unproxifiedUrl = 'https://some.one';
				const errorMessage = 'foo';
				spyOn(configService, 'getValueAsPath').and.throwError(errorMessage);
				const warnSpy = spyOn(console, 'warn');

				const proxifiedUrl = bvvProxifyUrlProvider(unproxifiedUrl);

				expect(proxifiedUrl).toBe(unproxifiedUrl);
				expect(warnSpy).toHaveBeenCalledWith(new Error(errorMessage));
			});
		});
	});
});
