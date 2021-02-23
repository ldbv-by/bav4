import { provide } from '../../../../src/modules/map/i18n/olMap.provider';


describe('i18n for map module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_zoom_in_button).toBe('Vergrößere Kartenausschnitt');
		expect(map.map_zoom_out_button).toBe('Verkleinere Kartenausschnitt');
		expect(map.map_info_button).toBe('Information');
		expect(map.map_info_button_help).toBe('Hilfe');
		expect(map.map_info_button_contact).toBe('Kontakt');
		expect(map.map_info_button_about).toBe('Impressum');
		expect(map.map_zoom_extent_button).toBe('Ganz Bayern anzeigen');
		expect(map.map_context_menu_content_icon).toBe('In die Zwischenablage kopieren');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.map_zoom_in_button).toBe('Zoom in');
		expect(map.map_zoom_out_button).toBe('Zoom out');
		expect(map.map_info_button).toBe('Information');
		expect(map.map_info_button_help).toBe('Help');
		expect(map.map_info_button_contact).toBe('Contact');
		expect(map.map_info_button_about).toBe('About us');
		expect(map.map_context_menu_content_icon).toBe('Copy to clipboard');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});