import { provide } from '../../../../src/modules/share/i18n/share.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.share_dialog_link_title).toBe('Editierbarkeit');
		expect(map.share_dialog_link_original).toBe(
			'Alle, die über diesen Link verfügen, können die Original-Zeichnung verändern, ohne dass ein neuer Link generiert werden muss. Diese Funktion ist sinnvoll für Zeichnungen, die von mehreren Personen bearbeitet werden.'
		);
		expect(map.share_dialog_link_copy).toBe(
			'Alle, die über diesen Link verfügen, können die Zeichnung sehen und verändern. Wird die Zeichnung verändert, entsteht dadurch eine neue Zeichnung, die man nur durch die Erzeugung eines neuen Links wiederum teilen kann. Diese Funktion ist sinnvoll für Zeichnungen, die nur mit anderen geteilt, jedoch nicht von mehreren Personen bearbeitet werden sollen.'
		);
		expect(map.share_dialog_api).toBe('Klicken, um zu teilen');
		expect(map.share_dialog_api_failed).toBe('Das Teilen ist fehlgeschlagen');
		expect(map.share_dialog_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.share_dialog_infographic_original).toBe('Original');
		expect(map.share_dialog_infographic_copy).toBe('Kopie');
		expect(map.share_clipboard_link_notification_text).toBe('Der Link');
		expect(map.share_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
		expect(map.share_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.share_dialog_link_title).toBe('Editability');
		expect(map.share_dialog_link_original).toBe(
			'Everyone who has this link can modify the original drawing without having to generate a new link. This function is useful for drawings that are edited by several people.'
		);
		expect(map.share_dialog_link_copy).toBe(
			'Everyone who has this link can modify the original drawing. By modification a new drawing will be created that only can be shared with a new link. This function is useful for drawings that shouldn’t be edited by others.'
		);
		expect(map.share_dialog_api).toBe('Click to share');
		expect(map.share_dialog_api_failed).toBe('Sharing has failed');
		expect(map.share_dialog_copy_icon).toBe('Copy to clipboard');
		expect(map.share_dialog_infographic_original).toBe('Original');
		expect(map.share_dialog_infographic_copy).toBe('Copy');
		expect(map.share_clipboard_link_notification_text).toBe('The link');
		expect(map.share_clipboard_success).toBe('was copied to clipboard');
		expect(map.share_clipboard_error).toBe('"Copy to clipboard" is not available');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 11;
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
