import { TranslationService } from '../../src/services/TranslationService';
import { $injector } from '../../src/injection';


describe('TranslationService', () => {

	const configService = {
		getValue: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});

	it('provides translation', () => {
		const lang = 'en';
		spyOn(configService, 'getValue').and.returnValue(lang);

		const translationService = new TranslationService();

		translationService.register('testProvider', () => {
			return {
				'key0': 'value0',
				'key1': 'value1',
			};
		});

		expect(translationService.getMap(lang).size).toBe(2);
		expect(translationService.translate('key0')).toBe('value0');
		expect(translationService.translate('key1')).toBe('value1');
	});

	it('throws an error when provider already registered', () => {
		const lang = 'en';
		spyOn(configService, 'getValue').and.returnValue(lang);

		const translationService = new TranslationService();
		translationService.register('testProvider', () => { });

		expect(() => translationService.register('testProvider', () => { }))
			.toThrowError(/Provider testProvider already registered/);
	});

	it('throws an error when a key is already registered', () => {
		const lang = 'en';
		spyOn(configService, 'getValue').and.returnValue(lang);

		const translationService = new TranslationService();
		translationService.register('testProvider0', () => {
			return {
				'key0': 'value0',
				'key1': 'value1',
			};
		});
		translationService.register('testProvider1', () => {
			return {
				'key0': 'value0',
			};
		});
		expect(() => translationService.getMap())
			.toThrowError(/Key key0 already registered/);
	});

	it('provides the requested key when unknown and logs a warn statement', () => {
		const lang = 'de';
		spyOn(configService, 'getValue').and.returnValue(lang);
		const warnSpy = spyOn(console, 'warn');

		const translationService = new TranslationService();

		expect(translationService.translate('unknown_key')).toBe('unknown_key');
		expect(warnSpy).toHaveBeenCalled();
	});
});