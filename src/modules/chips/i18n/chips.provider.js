export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_profile: 'Profile'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_profile: 'Geländeprofil'
			};

		default:
			return {};
	}
};
