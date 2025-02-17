export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_interaction_button_container_routing: 'Complete routing',
				map_interaction_button_container_layerSwipe: 'Exit comparison tool'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_interaction_button_container_routing: 'Routing abschließen',
				map_interaction_button_container_layerSwipe: 'Vergleichen beenden'
			};

		default:
			return {};
	}
};
