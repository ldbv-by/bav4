import { provide } from '../../../../src/modules/map/i18n/contextMenu.provider';

describe('i18n for context menu', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_contextMenu_header).toBe('Location');
		expect(map.map_contextMenu_close_button).toBe('Close');
		expect(map.map_contextMenuContent_elevation_label).toBe('Elev.');
		expect(map.map_contextMenuContent_community_label).toBe('Community');
		expect(map.map_contextMenuContent_district_label).toBe('District');
		expect(map.map_contextMenuContent_copy_icon).toBe('Copy to clipboard');
		expect(map.map_contextMenuContent_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.map_contextMenuContent_clipboard_success).toBe('was copied to clipboard');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_contextMenu_header).toBe('Position');
		expect(map.map_contextMenu_close_button).toBe('Schließen');
		expect(map.map_contextMenuContent_elevation_label).toBe('Höhe');
		expect(map.map_contextMenuContent_community_label).toBe('Gemeinde');
		expect(map.map_contextMenuContent_district_label).toBe('Gemarkung');
		expect(map.map_contextMenuContent_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.map_contextMenuContent_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.map_contextMenuContent_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
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
