export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_geolocationButton_title_activate: 'Activate geolocation',
				map_geolocationButton_title_deactivate: 'Deactivate geolocation',
				map_geolocationButton_title_denied: 'Geolocation not allowed or not possible'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_geolocationButton_title_activate: 'Ortung einschalten',
				map_geolocationButton_title_deactivate: 'Ortung ausschalten',
				map_geolocationButton_title_denied: 'Ortung nicht erlaubt oder nicht möglich'
			};

		default:
			return {};
	}
};
