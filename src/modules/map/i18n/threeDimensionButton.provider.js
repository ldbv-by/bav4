export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_threeDimensionButton_title_2d: 'Switch to the 3D view',
				map_threeDimensionButton_title_3d: 'Switch to the 2D view'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_threeDimensionButton_title_2d: 'Zur 3D-Ansicht wechseln',
				map_threeDimensionButton_title_3d: 'Zur 2D-Ansicht wechseln'
			};

		default:
			return {};
	}
};
