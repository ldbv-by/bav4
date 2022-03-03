export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Catalog',
				header_tab_topics_title: 'Open catalog',
				header_tab_maps_button: 'Map configuration',
				header_tab_maps_title: 'Open map configuration',
				header_tab_more_button: 'More...',
				header_tab_more_title: 'More information and settings',
				header_close_button_title: 'Close menu',
				header_logo_badge: 'Beta'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				header_tab_topics_button: 'Katalog',
				header_tab_topics_title: 'Kartenauswahl öffnen',
				header_tab_maps_button: 'Karte',
				header_tab_maps_title: 'Kartenverwaltung öffnen',
				header_tab_more_button: 'Mehr...',
				header_tab_more_title: 'Weitere Informationen und Einstellungen',
				header_close_button_title: 'Menü schließen',
				header_logo_badge: 'Beta'
			};

		default:
			return {};
	}
};
