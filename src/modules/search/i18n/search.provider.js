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
				search_result_item_category_title_mountain: 'Mountain',
				search_result_item_type_vector_desc:
					'This GeoResource is a vector layer. It contains (possibly many) selectable vector features with attributes.',
				search_result_item_type_vector_label: 'Vector',
				search_result_item_type_vector_title: 'This GeoResource is a vector layer',
				search_result_item_type_raster_desc: 'This GeoResource is a raster layer. It is delivered as image and cannot be styled.',
				search_result_item_type_raster_label: 'Raster',
				search_result_item_type_raster_title: 'This GeoResource is a raster layer'
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
				search_result_item_category_title_mountain: 'Berg',
				search_result_item_type_vector_desc:
					'Diese GeoResource ist eine Vektor-Ebene. Sie enthält (möglicherweise viele) selektierbare Vektor-Features mit Attributen.',
				search_result_item_type_vector_label: 'Vektor',
				search_result_item_type_vector_title: 'Diese GeoResource ist eine Vektor-Ebene',
				search_result_item_type_raster_desc: 'Diese GeoResource ist eine Raster-Ebene. Sie wird als Bild geliefert und kann nicht gestylt werden.',
				search_result_item_type_raster_label: 'Raster',
				search_result_item_type_raster_title: 'Diese GeoResource ist eine Raster-Ebene'
			};

		default:
			return {};
	}
};
