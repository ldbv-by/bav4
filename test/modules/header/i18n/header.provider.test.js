import { provide } from '../../../../src/modules/header/i18n/header.provider';

describe('i18n for header module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.header_tab_topics_button).toBe('Themen');
		expect(map.header_tab_routing_button).toBe('Routing');
		expect(map.header_tab_topics_title).toBe('Themen öffnen');
		expect(map.header_tab_maps_button).toBe('Karte');
		expect(map.header_tab_maps_title).toBe('Kartenverwaltung öffnen');
		expect(map.header_tab_misc_button).toBe('Mehr...');
		expect(map.header_tab_misc_title).toBe('Weitere Einstellungen und Informationen');
		expect(map.header_close_button_title).toBe('Menü schließen');
		expect(map.header_logo_badge).toBe('');
		expect(map.header_logo_badge_standalone).toBe('Demo');
		expect(map.header_emblem_title_standalone).toBe('bav4 auf github');
		expect(map.header_emblem_link_standalone).toBe('https://github.com/ldbv-by/bav4/');
		expect(map.header_search_placeholder).toBe('Suche nach Orten, Geodaten, Flurstücken ...');
		expect(map.header_search_title).toBe('Suche nach Orten, Adressen, Geodaten, Flurstücken, Koordinaten, Point of Interest ...');
		expect(map.header_search_clear_button).toBe('Löschen');
		expect(map.header_logo_title_open).toBe('Navigationsleiste einblenden');
		expect(map.header_logo_title_close).toBe('Navigationsleiste ausblenden');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.header_tab_topics_button).toBe('Topics');
		expect(map.header_tab_routing_button).toBe('Routing');
		expect(map.header_tab_topics_title).toBe('Open topics');
		expect(map.header_tab_maps_button).toBe('Map');
		expect(map.header_tab_maps_title).toBe('Open map configuration');
		expect(map.header_tab_misc_button).toBe('More...');
		expect(map.header_tab_misc_title).toBe('Additional settings and information');
		expect(map.header_close_button_title).toBe('Close menu');
		expect(map.header_logo_badge).toBe('');
		expect(map.header_logo_badge_standalone).toBe('Demo');
		expect(map.header_emblem_title_standalone).toBe('bav4 on github');
		expect(map.header_emblem_link_standalone).toBe('https://github.com/ldbv-by/bav4/');
		expect(map.header_search_placeholder).toBe('Search for places, geodata, cadastral parcels ...');
		expect(map.header_search_title).toBe('Search for places, addresses, geodata, cadastral parcels, coordinates, points of interest ...');
		expect(map.header_search_clear_button).toBe('Clear');
		expect(map.header_logo_title_open).toBe('Show navigation rail');
		expect(map.header_logo_title_close).toBe('Hide navigation rail');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 17;
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
