export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Places',	
				search_menu_geoResourceResultsPanel_label: 'Data'
			
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				search_menu_locationResultsPanel_label: 'Orte',	
				search_menu_geoResourceResultsPanel_label: 'Daten'
			};

		default:
			return {};
	}
};