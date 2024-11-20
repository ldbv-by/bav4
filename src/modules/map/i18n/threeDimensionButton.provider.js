export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_threeDimensionButton_title: 'Open the 3D view in a new window'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_threeDimensionButton_title: '3D-Ansicht in neuem Fenster öffnen'
			};

		default:
			return {};
	}
};
