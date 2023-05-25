export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item_label_kml: 'KML',
				export_item_description_kml: 'usable in BayernAtlas or Google Earth and many GIS-Applications',
				export_item_download_kml: '.kml',
				export_item_srid_selection: 'Select SRID',
				export_item_srid_selection_disabled: 'SRID is predefined'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item_label_kml: 'KML',
				export_item_description_kml: 'verwendbar im BayernAtlas oder Google Earth und vielen GIS-Anwendungen',
				export_item_download_kml: '.kml',
				export_item_srid_selection: 'SRID auswählen',
				export_item_srid_selection_disabled: 'SRID ist vordefiniert'
			};

		default:
			return {};
	}
};
