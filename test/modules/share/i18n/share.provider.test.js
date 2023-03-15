import { provide } from '../../../../src/modules/share/i18n/share.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.share_shareDialogContent_link).toBe('Jeder, der diesen Link hat, kann an dieser Zeichnung mitarbeiten');
		expect(map.share_shareDialogContent_link_title).toBe('geteilt über BayernAtlas.de');
		expect(map.share_shareDialogContent_api).toBe('Klicken, um zu teilen');
		expect(map.share_shareDialogContent_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.share_clipboard_link_notification_text).toBe('Der Link');
		expect(map.share_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
		expect(map.share_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.share_shareDialogContent_link).toBe('Anyone, who has this link, can edit this drawing');
		expect(map.share_shareDialogContent_link_title).toBe('shared with BayernAtlas.de');
		expect(map.share_shareDialogContent_api).toBe('Click to share');
		expect(map.share_shareDialogContent_copy_icon).toBe('Copy to clipboard');
		expect(map.share_clipboard_link_notification_text).toBe('The link');
		expect(map.share_clipboard_success).toBe('was copied to clipboard');
		expect(map.share_clipboard_error).toBe('"Copy to clipboard" is not available');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 7;
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
