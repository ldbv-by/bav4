import { ProcessEnvConfigService } from '../../src/utils/ProcessEnvConfigService';

describe('tests for ProcessEnvConfigService', () => {
	describe('test getValue()', () => {

		it('provides a value for an existing key', () => {
			// eslint-disable-next-line no-undef
			process.env.myKey = 'myValue';
			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('myKey')).toBe('myValue');
		});

		it('throws an exception for a non-existing key', () => {
			const configService = new ProcessEnvConfigService();
			expect(() => configService.getValue('unknown')).toThrow('No value found for \'unknown\'');
		});
	});

	describe('test hasKey()', () => {

		it('checks if a key exists', () => {
			// eslint-disable-next-line no-undef
			process.env.myKey = 'myValue';
			const configService = new ProcessEnvConfigService();

			expect(configService.hasKey('myKey')).toBeTrue();
			expect(configService.hasKey('unknown')).toBeFalse();
		});
	});
});
