export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Topics',
				header_tab_topics_title: 'Open topics',
				header_tab_maps_button: 'Layers configuration',
				header_tab_maps_title: 'Open layers configuration',
				header_tab_more_button: 'More...',
				header_tab_more_title: 'Show more',
				header_close_button_title: 'Close menu'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Themen',
				header_tab_topics_title: 'Themen öffnen',
				header_tab_maps_button: 'Ebenenverwaltung',
				header_tab_maps_title: 'Ebenenverwaltung öffnen',
				header_tab_more_button: 'Mehr...',
				header_tab_more_title: 'Mehr anzeigen',
				header_close_button_title: 'Menü schließen'
			};

		default:
			return {};
	}
};