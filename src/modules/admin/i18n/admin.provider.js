export const provide = (lang) => {
	switch (lang) {
		case 'de':
			return {
				admin_catalog_new_branch: 'Neue Gruppe',
				admin_catalog_save_draft: 'Entwurf speichern',
				admin_catalog_publish: 'Veröffentlichen',
				admin_catalog_loading_hint: 'Lade Baum',
				admin_catalog_error_message: 'Etwas ist beim Laden des Themen-Katalogs schiefgelaufen...',
				admin_catalog_empty_tree_hint: 'Neue Gruppe hinzufügen oder eine vorhandene Georessource in den Bereich ziehen.',
				admin_catalog_draft_saved_notification: 'Baum erfolgreich abgespeichert',
				admin_catalog_draft_save_failed_notification: 'Beim speichern ist ein Fehler aufgetreten',
				admin_catalog_published_notification: (params) => `Baum wurde erfolgreich auf "${params[0]}" veröffentlicht`,
				admin_catalog_publish_failed_notification: 'Beim veröffentlichen ist ein Fehler aufgetreten',
				admin_catalog_georesource_orphaned: 'Zugehörige GeoRessource wurde nicht gefunden',
				admin_catalog_warning_orphan: 'Einige Einträge enthalten verwaiste GeoRessourcen.',
				admin_environment: 'Umgebung',
				admin_environment_stage: 'Testumgebung',
				admin_environment_production: 'Produktion',
				admin_georesource_refresh: 'Aktualisieren',
				admin_georesource_filter_placeholder: 'Nach Georessourcen filtern...',
				admin_georesource_loading_hint: 'Lade Georessourcen',
				admin_modal_button_cancel: 'Abbrechen',
				admin_modal_button_confirm: 'Bestätigen',
				admin_modal_button_publish: 'Veröffentlichen',
				admin_modal_edit_label_title: 'Name bearbeiten',
				admin_modal_tree_dispose_title: 'Fortfahren verwirft Ihre Änderungen',
				admin_modal_branch_label: 'Gruppenname',
				admin_modal_publish_title: 'Veröffentlichen auf',
				admin_modal_publish_editor: 'Bearbeiter',
				admin_modal_publish_message: 'Bearbeitungsgrund',
				admin_required_field_error: 'Pflichtfeld'
			};
		case 'en':
			return {
				admin_catalog_new_branch: 'New Group',
				admin_catalog_save_draft: 'Save draft',
				admin_catalog_publish: 'Publish',
				admin_catalog_loading_hint: 'Loading Tree',
				admin_catalog_error_message: 'Something went wrong while loading the catalog...',
				admin_catalog_empty_tree_hint: 'Add a new group or a geo resource from the explorer.',
				admin_catalog_draft_saved_notification: 'Tree successfully saved',
				admin_catalog_draft_save_failed_notification: 'An error occurred while saving',
				admin_catalog_published_notification: (params) => `Tree successfully published to "${params[0]}"`,
				admin_catalog_publish_failed_notification: 'An error occurred while publishing',
				admin_catalog_georesource_orphaned: 'Associated GeoResource was not found',
				admin_catalog_warning_orphan: 'Some entries contain orphaned GeoResources.',
				admin_environment: 'Environment',
				admin_environment_stage: 'Test environment',
				admin_environment_production: 'Production',
				admin_georesource_refresh: 'Refresh',
				admin_georesource_filter_placeholder: 'Filter GeoResources...',
				admin_georesource_loading_hint: 'Loading GeoResources',
				admin_modal_button_cancel: 'Cancel',
				admin_modal_button_confirm: 'Confirm',
				admin_modal_button_publish: 'Veröffentlichen',
				admin_modal_edit_label_title: 'Edit Name',
				admin_modal_tree_dispose_title: 'Continuing will discard your changes',
				admin_modal_branch_label: 'Group Name',
				admin_modal_publish_title: 'Publish to',
				admin_modal_publish_editor: 'Editor',
				admin_modal_publish_message: 'Reason',
				admin_required_field_error: 'Required field'
			};
		default:
			return {};
	}
};
