import { ProcessEnvConfigService } from '../../src/utils/ProcessEnvConfigService';

describe('tests for ProcessEnvConfigService', () => {
	beforeEach(function () {
		// eslint-disable-next-line no-undef
		process.env = undefined;
	});
	describe('test getValue()', () => {

		it('provides a value for required keys', () => {
			// eslint-disable-next-line no-undef
			process.env = { 'NODE_ENV': 'development' };
			// eslint-disable-next-line no-undef
			process.env = { 'SEARCH_SERVICE_API_KEY': 'myValue' };

			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('RUNTIME_MODE')).toBe('development');
			expect(configService.getValue('SEARCH_SERVICE_API_KEY')).toBe('myValue');
		});

		it('throws an exception for a non-existing key', () => {
			// eslint-disable-next-line no-undef
			process.env = {};
			const configService = new ProcessEnvConfigService();

			expect(() => configService.getValue('unknown')).toThrow('No value found for \'unknown\'');
		});

		it('provides the the default value for a non-existing key', () => {
			// eslint-disable-next-line no-undef
			process.env = {};
			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('unknown', 42)).toBe(42);
		});
	});

	describe('test hasKey()', () => {

		it('checks if a key exists', () => {
			// eslint-disable-next-line no-undef
			process.env = { 'SEARCH_SERVICE_API_KEY': 'myValue' };

			const configService = new ProcessEnvConfigService();

			expect(configService.hasKey('SEARCH_SERVICE_API_KEY')).toBeTrue();
			expect(configService.hasKey('unknown')).toBeFalse();
		});

	});
});
