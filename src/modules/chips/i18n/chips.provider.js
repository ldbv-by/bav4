export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Elevation Profile'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Geländeprofil'
			};

		default:
			return {};
	}
};
