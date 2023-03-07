export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Elevation Profile',
				chips_assist_big_map: 'Show big map'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Geländeprofil',
				chips_assist_big_map: 'Große Karte anzeigen'
			};

		default:
			return {};
	}
};
