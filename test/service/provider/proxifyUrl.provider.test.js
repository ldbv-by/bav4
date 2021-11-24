import { $injector } from '../../../src/injection';
import { bvvProxifyUrlProvider } from '../../../src/services/provider/proxifyUrl.provider';

describe('proxyUrlTemplate', () => {
	const proxyUrl = 'https://proxy.url';
	const backendUrl = 'https://backend.url';

	describe('bvv proxified url provider', () => {

		const configService = {
			getValueAsPath: value => value === 'BACKEND_URL' ? backendUrl : proxyUrl
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService);
		});

		it('returns BVV specific proxified URL', () => {
			const proxifiedUrl = bvvProxifyUrlProvider('https://some.one');

			expect(proxifiedUrl).toBe('https://proxy.url?url=https%3A%2F%2Fsome.one');
		});

		it('does not proxify an already proxified URL', () => {
			const proxifiedUrl = bvvProxifyUrlProvider(`${proxyUrl}?url=https%3A%2F%2Fsome.one`);

			expect(proxifiedUrl).toBe('https://proxy.url?url=https%3A%2F%2Fsome.one');
		});

		it('does not proxify a backend URL', () => {
			const proxifiedUrl = bvvProxifyUrlProvider(`${backendUrl}/foo`);

			expect(proxifiedUrl).toBe('https://backend.url/foo');
		});

		describe('when config param PROXY_URL is not available', () => {

			it('it returns the the unproxified URL and logs a warn statement', () => {
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
