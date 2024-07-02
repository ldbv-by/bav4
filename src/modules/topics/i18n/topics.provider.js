export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				topics_menu_title: 'Topics',
				topics_catalog_panel_change_topic: 'Change topic',
				topics_catalog_leaf_no_georesource_title: 'Layer not available',
				topics_catalog_leaf_info: 'Info',
				topics_catalog_contentPanel_topic_could_not_be_loaded: (params) => `The topic with the id "${params[0]}" could not be loaded`,
				topics_catalog_contentPanel_topic_not_available: 'The topic is not available'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				topics_menu_title: 'Themen',
				topics_catalog_panel_change_topic: 'Thema wechseln',
				topics_catalog_leaf_no_georesource_title: 'Ebene nicht verfügbar',
				topics_catalog_leaf_info: 'Info',
				topics_catalog_contentPanel_topic_could_not_be_loaded: (params) => `Das Thema mit der ID "${params[0]}" konnte nicht geladen werden`,
				topics_catalog_contentPanel_topic_not_available: 'Das Thema steht leider derzeit nicht zur Verfügung'
			};

		default:
			return {};
	}
};
