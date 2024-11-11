export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_interaction_button_container: 'Complete routing'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_interaction_button_container: 'Routing abschließen'
			};

		default:
			return {};
	}
};
