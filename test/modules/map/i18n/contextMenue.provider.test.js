import { provide } from '../../../../src/modules/map/i18n/contextMenue.provider';


describe('i18n for context menue', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.map_context_menue_header).toBe('Location');		
		expect(map.map_context_menue_close_button).toBe('Close');		
	});


	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_context_menue_header).toBe('Position');		
		expect(map.map_context_menue_close_button).toBe('Schließen');		
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});