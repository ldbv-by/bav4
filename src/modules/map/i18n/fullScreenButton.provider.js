export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_interaction_button_container_fullscreen_on: 'Start fullscreen',
				map_interaction_button_container_fullscreen_off: 'Exit fullscreen'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_interaction_button_container_fullscreen_on: 'Vollbild starten',
				map_interaction_button_container_fullscreen_off: 'Vollbild beenden'
			};

		default:
			return {};
	}
};
