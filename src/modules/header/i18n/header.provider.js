export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Topics',
				header_tab_routing_button: 'Routing',
				header_tab_topics_title: 'Open topics',
				header_tab_maps_button: 'Map',
				header_tab_maps_title: 'Open map configuration',
				header_tab_misc_button: 'More...',
				header_tab_misc_title: 'Additional settings and information',
				header_close_button_title: 'Close menu',
				header_logo_badge: '',
				header_logo_badge_standalone: 'Demo',
				header_emblem_title_standalone: 'bav4 on github',
				header_emblem_link_standalone: 'https://github.com/ldbv-by/bav4/',
				header_search_placeholder: 'Search for places, geodata, cadastral parcels ...',
				header_search_title: 'Search for places, addresses, geodata, cadastral parcels, coordinates, points of interest ...',
				header_search_clear_button: 'Clear',
				header_logo_title_open: 'Show navigation rail',
				header_logo_title_close: 'Hide navigation rail'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Themen',
				header_tab_routing_button: 'Routing',
				header_tab_topics_title: 'Themen öffnen',
				header_tab_maps_button: 'Karte',
				header_tab_maps_title: 'Kartenverwaltung öffnen',
				header_tab_misc_button: 'Mehr...',
				header_tab_misc_title: 'Weitere Einstellungen und Informationen',
				header_close_button_title: 'Menü schließen',
				header_logo_badge: '',
				header_logo_badge_standalone: 'Demo',
				header_emblem_title_standalone: 'bav4 auf github',
				header_emblem_link_standalone: 'https://github.com/ldbv-by/bav4/',
				header_search_placeholder: 'Suche nach Orten, Geodaten, Flurstücken ...',
				header_search_title: 'Suche nach Orten, Adressen, Geodaten, Flurstücken, Koordinaten, Point of Interest ...',
				header_search_clear_button: 'Löschen',
				header_logo_title_open: 'Navigationsleiste einblenden',
				header_logo_title_close: 'Navigationsleiste ausblenden'
			};

		default:
			return {};
	}
};
