export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Data',
				map_attributionInfo_collapse_title_open: 'show all',
				map_attributionInfo_collapse_title_close: 'close'
			};
			
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Daten',
				map_attributionInfo_collapse_title_open: 'alle anzeigen',
				map_attributionInfo_collapse_title_close: 'schließen'
			};

		default:
			return {};
	}
};