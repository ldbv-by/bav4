export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Places',
				search_menu_geoResourceResultsPanel_label: 'Data',
				search_menu_cpResultsPanel_label: 'Cadastral parcel',
				search_menu_showAll_label: 'Show more...'

			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Orte',
				search_menu_geoResourceResultsPanel_label: 'Daten',
				search_menu_cpResultsPanel_label: 'Flurstück',
				search_menu_showAll_label: 'Mehr...'
			};

		default:
			return {};
	}
};
