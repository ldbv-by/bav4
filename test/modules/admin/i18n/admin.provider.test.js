import { provide } from '../../../../src/modules/admin/i18n/admin.provider';

describe('i18n for admin', () => {
	it('provides translation for de', () => {
		const map = provide('de');
		expect(map.admin_georesource_refresh).toBe('Aktualisieren');
		expect(map.admin_georesource_filter_placeholder).toBe('Nach Georessourcen filtern...');
		expect(map.admin_catalog_new_branch).toBe('Neue Gruppe');
		expect(map.admin_catalog_save_draft).toBe('Entwurf speichern');
		expect(map.admin_catalog_publish).toBe('Veröffentlichen');
		expect(map.admin_catalog_error_message).toBe('Etwas ist beim Laden des Themen-Katalogs schiefgelaufen...');
		expect(map.admin_button_cancel).toBe('Abbrechen');
		expect(map.admin_button_confirm).toBe('Bestätigen');
		expect(map.admin_popup_edit_label_title).toBe('Name bearbeiten');
		expect(map.admin_popup_tree_dispose_title).toBe('Fortfahren verwirft Ihre Änderungen');
	});

	it('provides translation for en', () => {
		const map = provide('en');
		expect(map.admin_georesource_refresh).toBe('Refresh');
		expect(map.admin_georesource_filter_placeholder).toBe('Filter geo resources...');
		expect(map.admin_catalog_new_branch).toBe('New Group');
		expect(map.admin_catalog_save_draft).toBe('Save draft');
		expect(map.admin_catalog_publish).toBe('Publish');
		expect(map.admin_catalog_error_message).toBe('Something went wrong while loading the catalog...');
		expect(map.admin_button_cancel).toBe('Cancel');
		expect(map.admin_button_confirm).toBe('Confirm');
		expect(map.admin_popup_edit_label_title).toBe('Edit Name');
		expect(map.admin_popup_tree_dispose_title).toBe('Continuing will discard your changes');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 10;
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
