export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Data',
				map_attributionInfo_collapse_title_open: 'Show all',
				map_attributionInfo_collapse_title_close: 'Close'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Daten',
				map_attributionInfo_collapse_title_open: 'Alle anzeigen',
				map_attributionInfo_collapse_title_close: 'Schließen'
			};

		default:
			return {};
	}
};
