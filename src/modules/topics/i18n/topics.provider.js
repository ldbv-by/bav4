export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				topics_menu_title: 'Topics',
				topics_catalog_panel_change_topic: 'Change topic',
				topics_catalog_leaf_no_georesource_title: 'Layer not available',
				topics_catalog_leaf_info: 'Info'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				topics_menu_title: 'Themen',
				topics_catalog_panel_change_topic: 'Thema wechseln',
				topics_catalog_leaf_no_georesource_title: 'Ebene nicht verfügbar',
				topics_catalog_leaf_info: 'Info'
			};

		default:
			return {};
	}
};
