export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Topics',
				header_tab_topics_title: 'Open topics',
				header_tab_maps_button: 'Map',
				header_tab_maps_title: 'Open map',
				header_tab_misc_button: 'More...',
				header_tab_misc_title: 'Show more',
				header_close_button_title: 'Close menu',
				header_logo_badge: 'Beta',
				header_search_placeholder: 'Search'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Themen',
				header_tab_topics_title: 'Themen öffnen',
				header_tab_maps_button: 'Karte',
				header_tab_maps_title: 'Karte öffnen',
				header_tab_misc_button: 'Mehr...',
				header_tab_misc_title: 'Mehr anzeigen',
				header_close_button_title: 'Menü schließen',
				header_logo_badge: 'Beta',
				header_search_placeholder: 'Suchen'
			};

		default:
			return {};
	}
};
