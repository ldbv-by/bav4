import { $injector } from '../../../src/injection';
import { bvvProxifyUrlProvider } from '../../../src/services/provider/proxifyUrl.provider';

describe('proxyUrlTemplate', () => {

	describe('bvv', () => {

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
	});
});