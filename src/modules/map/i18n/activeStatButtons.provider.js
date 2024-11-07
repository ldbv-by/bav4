export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				active_state_buttons_stop_routing: 'Stop routing'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				active_state_buttons_stop_routing: 'Routing beenden'
			};

		default:
			return {};
	}
};
