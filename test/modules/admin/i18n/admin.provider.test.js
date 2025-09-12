import { provide } from '../../../../src/modules/admin/i18n/admin.provider';

describe('i18n for admin', () => {
	it('provides translation for de', () => {
		const map = provide('de');
		expect(map.admin_georesource_refresh).toBe('Aktualisieren');
		expect(map.admin_georesource_save_draft).toBe('Entwurf speichern');
		expect(map.admin_georesource_publish).toBe('Veröffentlichen');
		expect(map.admin_button_cancel).toBe('Abbrechen');
		expect(map.admin_button_confirm).toBe('Bestätigen');
		expect(map.admin_popup_edit_label_title).toBe('Name bearbeiten');
		expect(map.admin_popup_tree_dispose_title).toBe('Fortfahren verwirft Ihre Änderungen');
	});

	it('provides translation for en', () => {
		const map = provide('en');
		expect(map.admin_georesource_refresh).toBe('Refresh');
		expect(map.admin_georesource_save_draft).toBe('Save draft');
		expect(map.admin_georesource_publish).toBe('Publish');
		expect(map.admin_button_cancel).toBe('Cancel');
		expect(map.admin_button_confirm).toBe('Confirm');
		expect(map.admin_popup_edit_label_title).toBe('Edit Name');
		expect(map.admin_popup_tree_dispose_title).toBe('Continuing will discard your changes');
	});

	it('contains the expected amount of entries', () => {
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
