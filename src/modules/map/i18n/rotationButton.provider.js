export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_rotationButton_title: 'Reset rotation to north'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_rotationButton_title: 'Karte wieder nach Norden ausrichten'
			};

		default:
			return {};
	}
};
