export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_zoom_in_button: 'Zoom in',
				map_zoom_out_button: 'Zoom out',
				map_info_button: 'Information',
				map_info_button_help: 'Help',
				map_info_button_contact: 'Contact',
				map_info_button_about: 'About us',
				map_zoom_extent_button: 'Zoom to full extent'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_zoom_in_button: 'Vergrößere Kartenausschnitt',
				map_zoom_out_button: 'Verkleinere Kartenausschnitt',
				map_info_button: 'Information',
				map_info_button_help: 'Hilfe',
				map_info_button_contact: 'Kontakt',
				map_info_button_about: 'Impressum',
				map_zoom_extent_button: 'Ganz Bayern anzeigen'
			};

		default:
			return {};
	}
};