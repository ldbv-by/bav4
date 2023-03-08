export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Elevation Profile',
				chips_assist_view_large_map: 'View larger map'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Geländeprofil',
				chips_assist_view_large_map: 'Große Karte anzeigen'
			};

		default:
			return {};
	}
};
