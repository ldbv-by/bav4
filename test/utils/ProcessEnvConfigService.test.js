import { ProcessEnvConfigService } from '../../src/utils/ProcessEnvConfigService';

describe('tests for ProcessEnvConfigService', () => {
	beforeEach(function () {
		// eslint-disable-next-line no-undef
		process.env = undefined;
	});
	describe('test getValue()', () => {

		it('provides a value for an existing key', () => {
			// eslint-disable-next-line no-undef
			process.env = { 'myKey': 'myValue' };

			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('myKey')).toBe('myValue');
		});

		it('throws an exception for a non-existing key', () => {
			// eslint-disable-next-line no-undef
			process.env = { 'myKey': 'myValue' };
			const configService = new ProcessEnvConfigService();

			expect(() => configService.getValue('unknown')).toThrow('No value found for \'unknown\'');
		});

		it('throws an exception when env does not exist', () => {
			// eslint-disable-next-line no-undef
			process.env = undefined;
			const configService = new ProcessEnvConfigService();

			expect(() => configService.getValue('myKey')).toThrow('Env object not present, maybe .env-file is missing');
		});
	});

	describe('test hasKey()', () => {

		it('checks if a key exists', () => {
			// eslint-disable-next-line no-undef
			process.env = { 'myKey': 'myValue' };

			const configService = new ProcessEnvConfigService();

			expect(configService.hasKey('myKey')).toBeTrue();
			expect(configService.hasKey('unknown')).toBeFalse();

			// eslint-disable-next-line no-undef
			process.env = undefined;

			expect(configService.hasKey('myKey')).toBeFalse();
		});

	});
});
