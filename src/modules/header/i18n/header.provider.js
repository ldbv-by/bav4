export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_header_topics_button: 'Topics',
				header_header_topics_title: 'open Topics',
				header_header_maps_button: 'Maps',
				header_header_maps_title: 'open Maps',
				header_header_more_button: 'more',
				header_header_more_title: 'open more'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_header_topics_button: 'Themen',
				header_header_topics_title: 'Themen öffnen',
				header_header_maps_button: 'Dargestellte Karten',
				header_header_maps_title: 'Dargestellte Karten öffnen',
				header_header_more_button: 'mehr',
				header_header_more_title: 'mehr öffnen'
			};

		default:
			return {};
	}
};