
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_store_geolocation_denied: 'The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.',
				map_store_geolocation_not_available: 'The acquisition of the position failed.',
				map_store_layer_default_layer_name: 'Data',
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_store_geolocation_denied: 'Es ist keine Positionsbestimmung möglich, da ihre Browsereinstellungen dies nicht zulassen. Erlauben sie die Positionsbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.',
				map_store_geolocation_not_available: 'Es ist keine Positionsbestimmung möglich.',
				map_store_layer_default_layer_name: 'Daten',
			};

		default:
			return {};
	}
};
