export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Data',
				map_attributionInfo_fallback: 'No data available'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Daten',
				map_attributionInfo_fallback: 'Keine Daten verfügbar'
			};

		default:
			return {};
	}
};