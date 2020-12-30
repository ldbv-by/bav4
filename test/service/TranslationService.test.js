import { TranslationService } from '../../src/services/TranslationService';
import { $injector } from '../../src/injection';




describe('TranslationService', () => {
	const expectedSize = 5;

	const configService = {
		getValue: () => {}
	};
   
	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});
    
	it('provides translation for en',  () => {
		const lang = 'en';
		spyOn(configService, 'getValue').and.returnValue(lang);
        
		const translationService = new TranslationService();
        
		expect(translationService.getMap(lang).size).toBe(expectedSize);
		expect(translationService.translate('map_zoom_in_button')).toBe('Zoom in');
		expect(translationService.translate('map_zoom_out_button')).toBe('Zoom out');

		expect(translationService.translate('uiTheme_toggle_tooltip_dark')).toBe('Enable contrast mode');
		expect(translationService.translate('uiTheme_toggle_tooltip_light')).toBe('Disable contrast mode');

		expect(translationService.translate('modal_close_button')).toBe('Close');
	});
    
	it('provides translation for de',  () => {
		const lang = 'de';
		spyOn(configService, 'getValue').and.returnValue(lang);
        
		const translationService = new TranslationService();
        
		expect(translationService.getMap(lang).size).toBe(expectedSize);
		expect(translationService.translate('map_zoom_in_button')).toBe('Vergrößere Kartenausschnitt');
		expect(translationService.translate('map_zoom_out_button')).toBe('Verkleinere Kartenausschnitt');

		expect(translationService.translate('uiTheme_toggle_tooltip_dark')).toBe('Kontrastmodus aktivieren');
		expect(translationService.translate('uiTheme_toggle_tooltip_light')).toBe('Kontrastmodus deaktivieren');

		expect(translationService.translate('modal_close_button')).toBe('Schließen');
	});

	it('provides the requested key when unknown and logs a warn statement',  () => {
		const lang = 'de';
		spyOn(configService, 'getValue').and.returnValue(lang);
		const warnSpy =spyOn(console, 'warn');
        
		const translationService = new TranslationService();
        
		expect(translationService.translate('unknown_key')).toBe('unknown_key');
		expect(warnSpy).toHaveBeenCalled();
	});
});