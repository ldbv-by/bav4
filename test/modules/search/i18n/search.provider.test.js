import { provide } from '../../../../src/modules/search/i18n/search.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.search_menu_locationResultsPanel_label).toBe('Orte');
		expect(map.search_menu_geoResourceResultsPanel_label).toBe('Geodaten');
		expect(map.search_menu_cpResultsPanel_label).toBe('Flurstücke');
		expect(map.search_menu_showAll_label).toBe('Mehr...');
		expect(map.search_menu_importAll_label).toBe('Alle importieren');
		expect(map.search_menu_importAll_title).toBe('Alle Georessourcen importieren');
		expect(map.search_menu_removeAll_label).toBe('Alle entfernen');
		expect(map.search_menu_removeAll_title).toBe('Alle Georessourcen entfernen');
		expect(map.search_result_item_zoom_to_extent).toBe('Auf Inhalt zoomen');
		expect(map.search_result_item_info).toBe('Info');
		expect(map.search_result_item_copy).toBe('In die Zwischenablage kopieren');
		expect(map.search_result_item_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.search_result_item_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
		expect(map.search_result_item_category_title_default).toBe('Ort/Adresse');
		expect(map.search_result_item_category_title_forest).toBe('Wald');
		expect(map.search_result_item_category_title_waters).toBe('Gewässer');
		expect(map.search_result_item_category_title_school).toBe('Schule');
		expect(map.search_result_item_category_title_street).toBe('Straße/Platz');
		expect(map.search_result_item_category_title_hut).toBe('Gasthaus/Hütte');
		expect(map.search_result_item_category_title_landscape).toBe('Flurname');
		expect(map.search_result_item_category_title_mountain).toBe('Berg');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.search_menu_locationResultsPanel_label).toBe('Places');
		expect(map.search_menu_geoResourceResultsPanel_label).toBe('Geodata');
		expect(map.search_menu_cpResultsPanel_label).toBe('Cadastral parcel');
		expect(map.search_menu_showAll_label).toBe('Show more...');
		expect(map.search_menu_importAll_label).toBe('Import all');
		expect(map.search_menu_importAll_title).toBe('Import all GeoResources');
		expect(map.search_menu_removeAll_label).toBe('Remove all');
		expect(map.search_menu_removeAll_title).toBe('Remove all GeoResources');
		expect(map.search_result_item_zoom_to_extent).toBe('Zoom to extent');
		expect(map.search_result_item_info).toBe('Info');
		expect(map.search_result_item_copy).toBe('Copy to clipboard');
		expect(map.search_result_item_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.search_result_item_clipboard_success).toBe('was copied to clipboard');
		expect(map.search_result_item_category_title_default).toBe('Place/Address');
		expect(map.search_result_item_category_title_forest).toBe('Forest');
		expect(map.search_result_item_category_title_waters).toBe('Waters');
		expect(map.search_result_item_category_title_school).toBe('School');
		expect(map.search_result_item_category_title_street).toBe('Street/Place');
		expect(map.search_result_item_category_title_hut).toBe('Inn/Hut');
		expect(map.search_result_item_category_title_landscape).toBe('Landscape');
		expect(map.search_result_item_category_title_mountain).toBe('Mountain');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 21;
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
