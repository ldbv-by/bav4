export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				admin_georesource_refresh: 'Refresh',
				admin_catalog_new_branch: 'New Group',
				admin_catalog_save_draft: 'Save draft',
				admin_catalog_publish: 'Publish',
				admin_button_cancel: 'Cancel',
				admin_button_confirm: 'Confirm',
				admin_popup_edit_label_title: 'Edit Name',
				admin_popup_tree_dispose_title: 'Continuing will discard your changes'
			};

		case 'de':
			return {
				admin_georesource_refresh: 'Aktualisieren',
				admin_catalog_new_branch: 'Neue Gruppe',
				admin_catalog_save_draft: 'Entwurf speichern',
				admin_catalog_publish: 'Veröffentlichen',
				admin_button_cancel: 'Abbrechen',
				admin_button_confirm: 'Bestätigen',
				admin_popup_edit_label_title: 'Name bearbeiten',
				admin_popup_tree_dispose_title: 'Fortfahren verwirft Ihre Änderungen'
			};

		default:
			return {};
	}
};
