export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_header_topics_button: 'Topics',
				header_header_maps_button: 'Maps',
				header_header_more_button: 'more'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_header_topics_button: 'Themen',
				header_header_maps_button: 'Dargestellte Karten',
				header_header_more_button: 'mehr'
			};

		default:
			return {};
	}
};