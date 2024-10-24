export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_threeDimensionButton_title: 'lorem ipsum'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_threeDimensionButton_title: 'lorem ipsum'
			};

		default:
			return {};
	}
};
