import { ProcessEnvConfigService } from '../../src/services/ProcessEnvConfigService';

describe('tests for ProcessEnvConfigService', () => {

	beforeEach(function () {
		// eslint-disable-next-line no-undef
		const process = {
			env: {
			}
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

	describe('constructor', () => {
		it('warns when no properties could be found', () => {
			const warnSpy = spyOn(console, 'warn');
			new ProcessEnvConfigService();

			expect(warnSpy).toHaveBeenCalled();
		});
	});


	describe('getValue()', () => {

		it('provides a value for required keys from process.env', () => {
			const warnSpy = spyOn(console, 'warn');
			// eslint-disable-next-line no-undef
			process.env = {
				'SOFTWARE_INFO': 'SOFTWARE_INFO_value',
				'DEFAULT_LANG': 'DEFAULT_LANG_value',
				'PROXY_URL': 'PROXY_URL_value',
				'BACKEND_URL': 'BACKEND_URL_value',
				'SHORTENING_SERVICE_URL': 'SHORTENING_SERVICE_URL_value',
				'FIRST_STEPS_CONTENT_URL': 'HFIRST_STEPS_CONTENT_URL_value'
			};

			const configService = new ProcessEnvConfigService();

			expect(configService._properties.size).toBe(7);
			expect(configService.getValue('RUNTIME_MODE')).toBe('development');
			expect(configService.getValue('SOFTWARE_INFO')).toBe('SOFTWARE_INFO_value');
			expect(configService.getValue('DEFAULT_LANG')).toBe('DEFAULT_LANG_value');
			expect(configService.getValue('PROXY_URL')).toBe('PROXY_URL_value');
			expect(configService.getValue('BACKEND_URL')).toBe('BACKEND_URL_value');
			expect(configService.getValue('SHORTENING_SERVICE_URL')).toBe('SHORTENING_SERVICE_URL_value');
			expect(configService.getValue('FIRST_STEPS_CONTENT_URL')).toBe('HFIRST_STEPS_CONTENT_URL_value');

			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('provides a value for required keys from window.config', () => {
			const warnSpy = spyOn(console, 'warn');
			// eslint-disable-next-line no-undef
			window.ba_externalConfigProperties = {
				'SOFTWARE_INFO': 'SOFTWARE_INFO_value',
				'DEFAULT_LANG': 'DEFAULT_LANG_value',
				'PROXY_URL': 'PROXY_URL_value',
				'BACKEND_URL': 'BACKEND_URL_value',
				'SHORTENING_SERVICE_URL': 'SHORTENING_SERVICE_URL_value',
				'FIRST_STEPS_CONTENT_URL': 'FIRST_STEPS_CONTENT_URL_value'
			};

			const configService = new ProcessEnvConfigService();

			expect(configService._properties.size).toBe(7);
			expect(configService.getValue('RUNTIME_MODE')).toBe('development');
			expect(configService.getValue('SOFTWARE_INFO')).toBe('SOFTWARE_INFO_value');
			expect(configService.getValue('DEFAULT_LANG')).toBe('DEFAULT_LANG_value');
			expect(configService.getValue('PROXY_URL')).toBe('PROXY_URL_value');
			expect(configService.getValue('BACKEND_URL')).toBe('BACKEND_URL_value');
			expect(configService.getValue('SHORTENING_SERVICE_URL')).toBe('SHORTENING_SERVICE_URL_value');
			expect(configService.getValue('FIRST_STEPS_CONTENT_URL')).toBe('FIRST_STEPS_CONTENT_URL_value');

			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('throws an exception for a non-existing key', () => {
			const configService = new ProcessEnvConfigService();

			expect(() => configService.getValue('unknown')).toThrowError(Error, 'No value found for \'unknown\'');
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
				'BACKEND_URL': 'BACKEND_URL_value'
			};

			const configService = new ProcessEnvConfigService();

			expect(configService.getValueAsPath('BACKEND_URL')).toBe('BACKEND_URL_value/');
		});
	});

	describe('test hasKey()', () => {

		it('checks if a key exists', () => {
			// eslint-disable-next-line no-undef
			process.env = { 'DEFAULT_LANG': 'myValue' };

			const configService = new ProcessEnvConfigService();

			expect(configService.hasKey('DEFAULT_LANG')).toBeTrue();
			expect(configService.hasKey('unknown')).toBeFalse();
		});
	});
});
