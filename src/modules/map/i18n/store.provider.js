
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_store_geolocation_denied: 'The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.',					
			};
			
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_store_geolocation_denied: 'Es ist keine Positionsbestimmung möglich, da ihre Browsereinstellungen dies nicht zulassen. Erlauben sie die Positionsbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.',								
			};

		default:
			return {};
	}
};