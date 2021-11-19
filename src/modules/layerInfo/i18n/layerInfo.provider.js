export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerinfo_empty_layerInfo: 'No information for the layer found',
				layerinfo_layerInfo_response_error: 'The layer-information could not be loaded'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerinfo_empty_layerInfo: 'Keine Informationen für die Ebene gefunden',
				layerinfo_layerInfo_response_error: 'Die Ebenen-Information konnte nicht geladen werden'
			};

		default:
			return {};
	}
};
