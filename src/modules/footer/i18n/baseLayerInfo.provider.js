export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_baseLayerInfo_label: 'Basemap'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_baseLayerInfo_label: 'Hintergrundkarte'
			};

		default:
			return {};
	}
};