export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Places',
				search_menu_geoResourceResultsPanel_label: 'Data',
				search_menu_cpResultsPanel_label: 'Cadastral parcel',
				search_menu_showAll_label: 'Show more...',
				search_result_item_zoom_to_extent: 'Zoom to extent',
				search_result_item_info: 'Info'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Orte',
				search_menu_geoResourceResultsPanel_label: 'Daten',
				search_menu_cpResultsPanel_label: 'Flurstücke',
				search_menu_showAll_label: 'Mehr...',
				search_result_item_zoom_to_extent: 'Auf Inhalt zoomen',
				search_result_item_info: 'Info'
			};

		default:
			return {};
	}
};
