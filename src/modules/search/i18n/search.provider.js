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
				search_menu_importAll_title: 'Import all GeoResources',
				search_menu_removeAll_label: 'Remove all',
				search_menu_removeAll_title: 'Remove all GeoResources',
				search_result_item_zoom_to_extent: 'Zoom to extent',
				search_result_item_info: 'Info',
				search_result_item_copy: 'Copy to clipboard',
				search_result_item_clipboard_error: '"Copy to clipboard" is not available',
				search_result_item_clipboard_success: 'was copied to clipboard',
				search_result_item_category_title_default: 'Place/Address',
				search_result_item_category_title_forest: 'Forest',
				search_result_item_category_title_waters: 'Waters',
				search_result_item_category_title_school: 'School',
				search_result_item_category_title_street: 'Street/Place',
				search_result_item_category_title_hut: 'Inn/Hut',
				search_result_item_category_title_landscape: 'Landscape',
				search_result_item_category_title_mountain: 'Mountain'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Orte',
				search_menu_geoResourceResultsPanel_label: 'Geodaten',
				search_menu_cpResultsPanel_label: 'Flurstücke',
				search_menu_showAll_label: 'Mehr...',
				search_menu_importAll_label: 'Alle importieren',
				search_menu_importAll_title: 'Alle Georessourcen importieren',
				search_menu_removeAll_label: 'Alle entfernen',
				search_menu_removeAll_title: 'Alle Georessourcen entfernen',
				search_result_item_zoom_to_extent: 'Auf Inhalt zoomen',
				search_result_item_info: 'Info',
				search_result_item_copy: 'In die Zwischenablage kopieren',
				search_result_item_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				search_result_item_clipboard_success: 'wurde in die Zwischenablage kopiert',
				search_result_item_category_title_default: 'Ort/Adresse',
				search_result_item_category_title_forest: 'Wald',
				search_result_item_category_title_waters: 'Gewässer',
				search_result_item_category_title_school: 'Schule',
				search_result_item_category_title_street: 'Straße/Platz',
				search_result_item_category_title_hut: 'Gasthaus/Hütte',
				search_result_item_category_title_landscape: 'Flurname',
				search_result_item_category_title_mountain: 'Berg'
			};

		default:
			return {};
	}
};
