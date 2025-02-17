import { provide } from '../../../../src/modules/info/i18n/coordinateInfo.provider';

describe('i18n for coordinate info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.info_coordinateInfo_copy_icon).toBe('Copy to clipboard');
		expect(map.info_coordinateInfo_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.info_coordinateInfo_clipboard_success).toBe('was copied to clipboard');
		expect(map.info_coordinateInfo_elevation_label).toBe('Elev. (m)');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.info_coordinateInfo_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.info_coordinateInfo_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.info_coordinateInfo_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
		expect(map.info_coordinateInfo_elevation_label).toBe('Höhe (m)');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 4;
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
