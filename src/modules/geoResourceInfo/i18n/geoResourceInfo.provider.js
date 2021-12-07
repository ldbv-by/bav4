export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				geoResourceInfo_empty_geoResourceInfo: 'No Layer Information available',
				geoResourceInfo_geoResourceInfo_response_error: 'The Layer Information could not be loaded'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				geoResourceInfo_empty_geoResourceInfo: 'Keine Ebenen-Information verfügbar',
				geoResourceInfo_geoResourceInfo_response_error: 'Die Ebenen-Information konnte nicht geladen werden'
			};

		default:
			return {};
	}
};
