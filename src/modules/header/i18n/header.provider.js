export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Topics',
				header_tab_topics_title: 'open Topics',
				header_tab_maps_button: 'Maps',
				header_tab_maps_title: 'open Maps',
				header_tab_more_button: 'more',
				header_tab_more_title: 'open more'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Themen',
				header_tab_topics_title: 'Themen öffnen',
				header_tab_maps_button: 'Dargestellte Karten',
				header_tab_maps_title: 'Dargestellte Karten öffnen',
				header_tab_more_button: 'mehr',
				header_tab_more_title: 'mehr öffnen'
			};

		default:
			return {};
	}
};