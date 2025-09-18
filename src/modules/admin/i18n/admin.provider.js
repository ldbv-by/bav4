export const provide = (lang) => {
	switch (lang) {
		case 'de':
			return {
				admin_georesource_refresh: 'Aktualisieren',
				admin_georesource_filter_placeholder: 'Nach Georessourcen filtern...',
				admin_catalog_new_branch: 'Neue Gruppe',
				admin_catalog_save_draft: 'Entwurf speichern',
				admin_catalog_publish: 'Veröffentlichen',
				admin_catalog_error_message: 'Etwas ist beim Laden des Themen-Katalogs schiefgelaufen...',
				admin_button_cancel: 'Abbrechen',
				admin_button_confirm: 'Bestätigen',
				admin_popup_edit_label_title: 'Name bearbeiten',
				admin_popup_tree_dispose_title: 'Fortfahren verwirft Ihre Änderungen'
			};
		case 'en':
			return {
				admin_georesource_refresh: 'Refresh',
				admin_georesource_filter_placeholder: 'Filter GeoResources...',
				admin_catalog_new_branch: 'New Group',
				admin_catalog_save_draft: 'Save draft',
				admin_catalog_publish: 'Publish',
				admin_catalog_error_message: 'Something went wrong while loading the catalog...',
				admin_button_cancel: 'Cancel',
				admin_button_confirm: 'Confirm',
				admin_popup_edit_label_title: 'Edit Name',
				admin_popup_tree_dispose_title: 'Continuing will discard your changes'
			};
		default:
			return {};
	}
};
