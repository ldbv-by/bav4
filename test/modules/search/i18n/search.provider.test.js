import { provide } from '../../../../src/modules/search/i18n/search.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.search_menu_locationResultsPanel_label).toBe('Orte');
		expect(map.search_menu_geoResourceResultsPanel_label).toBe('Geodaten');
		expect(map.search_menu_cpResultsPanel_label).toBe('Flurstücke');
		expect(map.search_menu_showAll_label).toBe('Mehr...');
		expect(map.search_menu_importAll_label).toBe('Alle importieren');
		expect(map.search_menu_removeAll_label).toBe('Alle entfernen');
		expect(map.search_result_item_zoom_to_extent).toBe('Auf Inhalt zoomen');
		expect(map.search_result_item_info).toBe('Info');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.search_menu_locationResultsPanel_label).toBe('Places');
		expect(map.search_menu_geoResourceResultsPanel_label).toBe('Geodata');
		expect(map.search_menu_cpResultsPanel_label).toBe('Cadastral parcel');
		expect(map.search_menu_showAll_label).toBe('Show more...');
		expect(map.search_menu_importAll_label).toBe('Import all');
		expect(map.search_menu_removeAll_label).toBe('Remove all');
		expect(map.search_result_item_zoom_to_extent).toBe('Zoom to extent');
		expect(map.search_result_item_info).toBe('Info');
	});

	it('contains the expected amount of entries', () => {
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
