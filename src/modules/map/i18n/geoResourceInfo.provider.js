export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_geoResourceInfo_label: 'Base Layer'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_geoResourceInfo_label: 'Hintergrundkarte'
			};

		default:
			return {};
	}
};