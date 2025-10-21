import { provide } from '../../../../src/modules/admin/i18n/admin.provider';

describe('i18n for admin', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.admin_catalog_save_draft).toBe('Entwurf speichern');
		expect(map.admin_catalog_publish).toBe('Veröffentlichen');
		expect(map.admin_catalog_loading_hint).toBe('Lade Baum');
		expect(map.admin_catalog_error_message).toBe('Etwas ist beim Laden des Themen-Katalogs schiefgelaufen...');
		expect(map.admin_catalog_empty_tree_hint).toBe('Neue Gruppe hinzufügen oder eine vorhandene Georessource in den Bereich ziehen.');
		expect(map.admin_catalog_draft_saved_notification).toBe('Baum erfolgreich abgespeichert');
		expect(map.admin_catalog_draft_save_failed_notification).toBe('Beim speichern ist ein Fehler aufgetreten');
		expect(map.admin_catalog_published_notification(['foo'])).toBe('Baum wurde erfolgreich auf "foo" veröffentlicht');
		expect(map.admin_catalog_publish_failed_notification).toBe('Beim veröffentlichen ist ein Fehler aufgetreten');
		expect(map.admin_environment).toBe('Umgebung');
		expect(map.admin_environment_stage).toBe('Testumgebung');
		expect(map.admin_environment_production).toBe('Produktion');
		expect(map.admin_georesource_refresh).toBe('Aktualisieren');
		expect(map.admin_georesource_filter_placeholder).toBe('Nach Georessourcen filtern...');
		expect(map.admin_georesource_loading_hint).toBe('Lade Georessourcen');
		expect(map.admin_modal_button_cancel).toBe('Abbrechen');
		expect(map.admin_modal_button_confirm).toBe('Bestätigen');
		expect(map.admin_modal_button_publish).toBe('Veröffentlichen');
		expect(map.admin_modal_edit_label_title).toBe('Name bearbeiten');
		expect(map.admin_modal_tree_dispose_title).toBe('Fortfahren verwirft Ihre Änderungen');
		expect(map.admin_modal_publish_title).toBe('Veröffentlichen auf');
		expect(map.admin_modal_branch_label).toBe('Gruppenname');
		expect(map.admin_modal_publish_editor).toBe('Bearbeiter');
		expect(map.admin_modal_publish_message).toBe('Bearbeitungsgrund');
		expect(map.admin_required_field_error).toBe('Pflichtfeld');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.admin_catalog_save_draft).toBe('Save draft');
		expect(map.admin_catalog_publish).toBe('Publish');
		expect(map.admin_catalog_loading_hint).toBe('Loading Tree');
		expect(map.admin_catalog_error_message).toBe('Something went wrong while loading the catalog...');
		expect(map.admin_catalog_empty_tree_hint).toBe('Add a new group or a geo resource from the explorer.');
		expect(map.admin_catalog_draft_saved_notification).toBe('Tree successfully saved');
		expect(map.admin_catalog_draft_save_failed_notification).toBe('An error occurred while saving');
		expect(map.admin_catalog_published_notification(['foo'])).toBe('Tree successfully published to "foo"');
		expect(map.admin_catalog_publish_failed_notification).toBe('An error occurred while publishing');
		expect(map.admin_environment).toBe('Environment');
		expect(map.admin_environment_stage).toBe('Test environment');
		expect(map.admin_environment_production).toBe('Production');
		expect(map.admin_georesource_refresh).toBe('Refresh');
		expect(map.admin_georesource_filter_placeholder).toBe('Filter GeoResources...');
		expect(map.admin_georesource_loading_hint).toBe('Loading GeoResources');
		expect(map.admin_modal_button_cancel).toBe('Cancel');
		expect(map.admin_modal_button_confirm).toBe('Confirm');
		expect(map.admin_modal_button_publish).toBe('Veröffentlichen');
		expect(map.admin_modal_edit_label_title).toBe('Edit Name');
		expect(map.admin_modal_tree_dispose_title).toBe('Continuing will discard your changes');
		expect(map.admin_modal_branch_label).toBe('Group Name');
		expect(map.admin_modal_publish_title).toBe('Publish to');
		expect(map.admin_modal_publish_editor).toBe('Editor');
		expect(map.admin_modal_publish_message).toBe('Reason');
		expect(map.admin_required_field_error).toBe('Required field');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 26;
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
