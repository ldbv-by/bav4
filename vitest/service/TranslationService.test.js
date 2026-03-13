import { TranslationService } from '@src/services/TranslationService';
import { $injector } from '@src/injection';

describe('TranslationService', () => {
	let instanceUnderTest;
	const configService = {
		getValue: () => {}
	};
	const environmentService = {
		isStandalone: () => false
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('EnvironmentService', environmentService);
	});

	beforeEach(() => {
		instanceUnderTest = new TranslationService();
	});

	it('provides translations from a provider', () => {
		const lang = 'en';
		vi.spyOn(configService, 'getValue').mockReturnValue(lang);

		instanceUnderTest.register('testProvider', () => {
			return {
				key0: 'value0',
				key1: () => 'value1'
			};
		});

		expect(instanceUnderTest.getMap().size).toBe(2);
		expect(instanceUnderTest.translate('key0')).toBe('value0');
		expect(instanceUnderTest.translate('key1')).toBe('value1');
	});

	it('provides updated translations from a provider', () => {
		vi.spyOn(configService, 'getValue').mockReturnValue('en');
		const spy = vi.spyOn(instanceUnderTest, '_filter');
		instanceUnderTest.register('testProvider', (lang) => {
			return lang === 'de'
				? {
						key0: 'value0_de'
					}
				: {
						key0: 'value0_en'
					};
		});

		expect(instanceUnderTest.translate('key0')).toBe('value0_en');

		instanceUnderTest.reload('de');

		expect(instanceUnderTest.translate('key0')).toBe('value0_de');
		expect(spy).toHaveBeenCalledTimes(2);
	});

	it('throws an error when provider already registered', () => {
		vi.spyOn(configService, 'getValue').mockReturnValue('en');

		instanceUnderTest.register('testProvider', () => {
			return {
				key0: 'value0'
			};
		});

		expect(() =>
			instanceUnderTest.register('testProvider', () => {
				return {
					key0: 'value0'
				};
			})
		).toThrowError(/Provider testProvider already registered/);
	});

	it('throws an error when a key is already registered', () => {
		vi.spyOn(configService, 'getValue').mockReturnValue('en');

		instanceUnderTest.register('testProvider0', () => {
			return {
				key0: 'value0',
				key1: 'value1'
			};
		});

		expect(() => {
			instanceUnderTest.register('testProvider1', () => {
				return {
					key0: 'value0'
				};
			});
		}).toThrowError(/Key key0 already registered/);
	});
	describe('key is unknown', () => {
		it('returns the key and logs a warn statement', () => {
			vi.spyOn(configService, 'getValue').mockReturnValue('de');
			const warnSpy = vi.spyOn(console, 'warn');

			expect(instanceUnderTest.translate('unknown_key')).toBe('unknown_key');
			expect(warnSpy).toHaveBeenCalled();
		});
	});

	describe('key is unknown and service is called with silent flag', () => {
		it('returns the key and does NOT logs a warn statement', () => {
			vi.spyOn(configService, 'getValue').mockReturnValue('de');
			const warnSpy = vi.spyOn(console, 'warn');

			expect(instanceUnderTest.translate('unknown_key', [], true)).toBe('unknown_key');
			expect(warnSpy).not.toHaveBeenCalled();
		});
	});

	it('filters a value when app is in standalone mode', () => {
		vi.spyOn(configService, 'getValue').mockReturnValue('de');
		vi.spyOn(environmentService, 'isStandalone').mockReturnValue(true);
		instanceUnderTest.register('testProvider', () => {
			return {
				key0: 'value BayernAtlas_de'
			};
		});

		expect(instanceUnderTest.translate('key0')).toBe('value bav4_de');
	});
});
