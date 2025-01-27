export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Places',
				search_menu_geoResourceResultsPanel_label: 'Geodata',
				search_menu_cpResultsPanel_label: 'Cadastral parcel',
				search_menu_showAll_label: 'Show more...',
				search_menu_importAll_label: 'Import all',
				search_menu_removeAll_label: 'Remove all',
				search_result_item_zoom_to_extent: 'Zoom to extent',
				search_result_item_info: 'Info',
				search_result_item_copy: 'Copy to clipboard',
				search_result_item_clipboard_error: '"Copy to clipboard" is not available',
				search_result_item_clipboard_success: 'was copied to clipboard'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Orte',
				search_menu_geoResourceResultsPanel_label: 'Geodaten',
				search_menu_cpResultsPanel_label: 'Flurstücke',
				search_menu_showAll_label: 'Mehr...',
				search_menu_importAll_label: 'Alle importieren',
				search_menu_removeAll_label: 'Alle entfernen',
				search_result_item_zoom_to_extent: 'Auf Inhalt zoomen',
				search_result_item_info: 'Info',
				search_result_item_copy: 'In die Zwischenablage kopieren',
				search_result_item_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				search_result_item_clipboard_success: 'wurde in die Zwischenablage kopiert'
			};

		default:
			return {};
	}
};
