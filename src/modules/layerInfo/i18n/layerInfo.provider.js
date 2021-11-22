export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerinfo_empty_layerInfo: 'No Layer Information available',
				layerinfo_layerInfo_response_error: 'The Layer Information could not be loaded'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerinfo_empty_layerInfo: 'Kein Ebenen-Information verfügbar',
				layerinfo_layerInfo_response_error: 'Die Ebenen-Information konnte nicht geladen werden'
			};

		default:
			return {};
	}
};
