import { ProcessEnvConfigService } from '../../src/services/ProcessEnvConfigService';

describe('tests for ProcessEnvConfigService', () => {
	beforeEach(function () {
		 
		const process = {
			env: {}
		};
		window.process = process;
		window.ba_externalConfigProperties = {};
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

	describe('initialization', () => {
		it('warns when a properties could not be found', () => {
			const warnSpy = spyOn(console, 'warn');

			const instance = new ProcessEnvConfigService();

			expect(instance.isLoggingEnabled()).toBeTrue();
			expect(warnSpy).toHaveBeenCalledTimes(4);
		});
		it('does NOT warn when configured accordingly', () => {
			const warnSpy = spyOn(console, 'warn');

			const instance = new ProcessEnvConfigService(false);

			expect(instance.isLoggingEnabled()).toBeFalse();
			expect(warnSpy).not.toHaveBeenCalled();
		});
	});

	describe('static properties', () => {
		it('defines a list of properties whose absence does not trigger logging', async () => {
			expect(ProcessEnvConfigService.SILENT_PROPERTY_KEYS).toEqual(['BACKEND_ADMIN_TOKEN']);
		});
	});

	describe('getValue()', () => {
		it('provides the correct set of values', () => {
			const configService = new ProcessEnvConfigService();

			expect(configService._properties.size).toBe(9);
		});

		it('provides hardcoded values', () => {
			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('SOFTWARE_VERSION')).toBe('4.5');
		});

		it('provides a value for required keys from process.env', () => {
			const warnSpy = spyOn(console, 'warn');
			 
			process.env = {
				SOFTWARE_INFO: 'SOFTWARE_INFO_value',
				DEFAULT_LANG: 'DEFAULT_LANG_value',
				PROXY_URL: 'PROXY_URL_value',
				FRONTEND_URL: 'FRONTEND_URL_value',
				BACKEND_URL: 'BACKEND_URL_value',
				BACKEND_ADMIN_TOKEN: 'BACKEND_ADMIN_TOKEN_value',
				SHORTENING_SERVICE_URL: 'SHORTENING_SERVICE_URL_value'
			};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('RUNTIME_MODE')).toBe('development');
			expect(configService.getValue('SOFTWARE_INFO')).toBe('SOFTWARE_INFO_value');
			expect(configService.getValue('DEFAULT_LANG')).toBe('DEFAULT_LANG_value');
			expect(configService.getValue('PROXY_URL')).toBe('PROXY_URL_value');
			expect(configService.getValue('FRONTEND_URL')).toBe('FRONTEND_URL_value');
			expect(configService.getValue('BACKEND_URL')).toBe('BACKEND_URL_value');
			expect(configService.getValue('BACKEND_ADMIN_TOKEN')).toBe('BACKEND_ADMIN_TOKEN_value');
			expect(configService.getValue('SHORTENING_SERVICE_URL')).toBe('SHORTENING_SERVICE_URL_value');

			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('provides a value for required keys from window.config', () => {
			const warnSpy = spyOn(console, 'warn');
			 
			window.ba_externalConfigProperties = {
				SOFTWARE_INFO: 'SOFTWARE_INFO_value',
				DEFAULT_LANG: 'DEFAULT_LANG_value',
				PROXY_URL: 'PROXY_URL_value',
				FRONTEND_URL: 'FRONTEND_URL_value',
				BACKEND_URL: 'BACKEND_URL_value',
				BACKEND_ADMIN_TOKEN: 'BACKEND_ADMIN_TOKEN_value',
				SHORTENING_SERVICE_URL: 'SHORTENING_SERVICE_URL_value'
			};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('RUNTIME_MODE')).toBe('development');
			expect(configService.getValue('SOFTWARE_INFO')).toBe('SOFTWARE_INFO_value');
			expect(configService.getValue('DEFAULT_LANG')).toBe('DEFAULT_LANG_value');
			expect(configService.getValue('PROXY_URL')).toBe('PROXY_URL_value');
			expect(configService.getValue('BACKEND_URL')).toBe('BACKEND_URL_value');
			expect(configService.getValue('BACKEND_ADMIN_TOKEN')).toBe('BACKEND_ADMIN_TOKEN_value');
			expect(configService.getValue('SHORTENING_SERVICE_URL')).toBe('SHORTENING_SERVICE_URL_value');

			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('provides a fallback value for "DEFAULT_LANG"', () => {
			 
			process.env = {};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('DEFAULT_LANG')).toBe('en');
		});

		it('provides a fallback value for "FRONTEND_URL"', () => {
			 
			process.env = {};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('FRONTEND_URL')).toBe(`${location.protocol}//${location.host}`);
		});

		it('throws an exception for a non-existing key', () => {
			const configService = new ProcessEnvConfigService();

			expect(() => configService.getValue('unknown')).toThrowError(Error, "No value found for 'unknown'");
		});

		it('provides the default value for a non-existing key', () => {
			const configService = new ProcessEnvConfigService();

			expect(configService.getValue('unknown', 42)).toBe(42);
		});
	});

	describe('getValueAsPath()', () => {
		it('provides a path for required keys', () => {
			 
			process.env = {
				BACKEND_URL: 'BACKEND_URL_value'
			};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValueAsPath('BACKEND_URL')).toBe('BACKEND_URL_value/');
		});
	});

	describe('test hasKey()', () => {
		it('checks if a key exists', () => {
			 
			process.env = { DEFAULT_LANG: 'myValue' };

			const configService = new ProcessEnvConfigService();

			expect(configService.hasKey('DEFAULT_LANG')).toBeTrue();
			expect(configService.hasKey('unknown')).toBeFalse();
		});
	});
});
