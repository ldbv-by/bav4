export const coordinateSelectProvider = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				footer_coordinate_select: 'Choose coordinate system'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				footer_coordinate_select: 'Koordinatensystem auswählen'
			};

		default:
			return {};
	}
};
