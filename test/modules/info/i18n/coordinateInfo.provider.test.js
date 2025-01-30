import { provide } from '../../../../src/modules/info/i18n/coordinateInfo.provider';

describe('i18n for coordinate info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.commons_coordinateInfo_copy_icon).toBe('Copy to clipboard');
		expect(map.commons_coordinateInfo_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.commons_coordinateInfo_clipboard_success).toBe('was copied to clipboard');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.commons_coordinateInfo_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.commons_coordinateInfo_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.commons_coordinateInfo_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 3;
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
