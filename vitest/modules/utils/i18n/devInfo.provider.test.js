import { provide } from '../../../../src/modules/utils/i18n/devInfo.provider';

describe('i18n for devInfo module', () => {
	it('provides translation for de', () => {
		const map = provide('de');
		expect(map.devInfo_copy_to_clipboard_title).toBe('Build Informationen in die Zwischenablage kopieren');
		expect(map.devInfo_copy_to_clipboard_success).toBe('Build Informationen wurden in die Zwischenablage kopiert');
		expect(map.devInfo_copy_to_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.devInfo_open_showcase_modal).toBe('Showcase öffnen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.devInfo_copy_to_clipboard_title).toBe('Copy build information to clipboard');
		expect(map.devInfo_copy_to_clipboard_success).toBe('Build information has been copied to the clipboard');
		expect(map.devInfo_copy_to_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.devInfo_open_showcase_modal).toBe('open showcase');
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
