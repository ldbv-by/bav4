export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_geoResourceInfo_label: 'Georesource'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_geoResourceInfo_label: 'Georessource'
			};

		default:
			return {};
	}
};