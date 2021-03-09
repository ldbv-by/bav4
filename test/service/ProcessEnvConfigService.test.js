import { ProcessEnvConfigService } from '../../src/services/ProcessEnvConfigService';

describe('tests for ProcessEnvConfigService', () => {

	beforeEach(function () {
		// eslint-disable-next-line no-undef
		process.env = {};
	});
	describe('test _trailingSlash()', () => {
		it('appends a trailing slash when needed', () => {
			const configService = new ProcessEnvConfigService();

			expect(configService._trailingSlash('some', true)).toBe('some/');
			expect(configService._trailingSlash('some/', true)).toBe('some/');
			expect(configService._trailingSlash(' some ', true)).toBe('some/');
			expect(configService._trailingSlash()).toBeUndefined();
		});

		it('removes a trailing slash when needed', () => {
			const configService = new ProcessEnvConfigService();

			expect(configService._trailingSlash('some', false)).toBe('some');
			expect(configService._trailingSlash('some/', false)).toBe('some');
			expect(configService._trailingSlash('some/ ', false)).toBe('some');
			expect(configService._trailingSlash()).toBeUndefined();
		});
	});

	describe('constructor', () => {
		it('warns when no properties could be found', () => {
			const warnSpy = spyOn(console, 'warn');
			new ProcessEnvConfigService();

			expect(warnSpy).toHaveBeenCalled();
		});
	});


	describe('getValue()', () => {

		it('provides a value for required keys', () => {
			const warnSpy = spyOn(console, 'warn');
			// eslint-disable-next-line no-undef
			process.env = {
				'SEARCH_SERVICE_API_KEY': 'SEARCH_SERVICE_API_KEY_value',
				'SOFTWARE_INFO': 'SOFTWARE_INFO_value',
				'DEFAULT_LANG': 'DEFAULT_LANG_value',
				'PROXY_URL': 'PROXY_URL_value',
				'BACKEND_URL': 'BACKEND_URL_value',
			};

			const configService = new ProcessEnvConfigService();

			expect(configService._properties.size).toBe(6);
			expect(configService.getValue('RUNTIME_MODE')).toBe('development');
			expect(configService.getValue('SEARCH_SERVICE_API_KEY')).toBe('SEARCH_SERVICE_API_KEY_value');
			expect(configService.getValue('SOFTWARE_INFO')).toBe('SOFTWARE_INFO_value');
			expect(configService.getValue('DEFAULT_LANG')).toBe('DEFAULT_LANG_value');
			expect(configService.getValue('PROXY_URL')).toBe('PROXY_URL_value');
			expect(configService.getValue('BACKEND_URL')).toBe('BACKEND_URL_value');

			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('throws an exception for a non-existing key', () => {
			const configService = new ProcessEnvConfigService();

			expect(() => configService.getValue('unknown')).toThrow('No value found for \'unknown\'');
		});

		it('provides the the default value for a non-existing key', () => {
			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('unknown', 42)).toBe(42);
		});
	});

	describe('getValueAsPath()', () => {

		it('provides a path for required keys', () => {
			// eslint-disable-next-line no-undef
			process.env = {
				'BACKEND_URL': 'BACKEND_URL_value',
			};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValueAsPath('BACKEND_URL')).toBe('BACKEND_URL_value/');
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
