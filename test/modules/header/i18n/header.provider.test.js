import { provide } from '../../../../src/modules/header/i18n/header.provider';


describe('i18n for header module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.header_tab_topics_button).toBe('Katalog');
		expect(map.header_tab_topics_title).toBe('Kartenauswahl öffnen');
		expect(map.header_tab_maps_button).toBe('Karte');
		expect(map.header_tab_maps_title).toBe('Kartenverwaltung öffnen');
		expect(map.header_tab_more_button).toBe('Mehr...');
		expect(map.header_tab_more_title).toBe('Weitere Informationen und Einstellungen');
		expect(map.header_close_button_title).toBe('Menü schließen');
		expect(map.header_logo_badge).toBe('Beta');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.header_tab_topics_button).toBe('Catalog');
		expect(map.header_tab_topics_title).toBe('Open catalog');
		expect(map.header_tab_maps_button).toBe('Map configuration');
		expect(map.header_tab_maps_title).toBe('Open map configuration');
		expect(map.header_tab_more_button).toBe('More...');
		expect(map.header_tab_more_title).toBe('More information and settings');
		expect(map.header_close_button_title).toBe('Close menu');
		expect(map.header_logo_badge).toBe('Beta');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 8;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
