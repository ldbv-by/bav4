export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item_label_kml: 'KML',
				export_item_description_kml: 'saves styles (symbols, color and width) and all geometry types',
				export_item_download_kml: '.kml',
				export_item_label_gpx: 'GPX',
				export_item_description_gpx: 'saves points and linestrings (tracks). Polygons are converted to linestrings',
				export_item_download_gpx: '.gpx',
				export_item_label_geojson: 'GeoJSON',
				export_item_description_geojson: 'saves styles (symbols, color and width) and all geometry types',
				export_item_download_geojson: '.geojson',
				export_item_label_ewkt: 'EWKT',
				export_item_description_ewkt: 'saves all geometry types, no styles',
				export_item_download_ewkt: '.txt',
				export_item_srid_selection: 'Select SRID',
				export_item_srid_selection_disabled: 'SRID is predefined'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item_label_kml: 'KML',
				export_item_description_kml: 'übernimmt Stil (Symbol, Farbe und Strichstärke) und alle Geometrietypen',
				export_item_download_kml: '.kml',
				export_item_label_gpx: 'GPX',
				export_item_description_gpx: 'übernimmt die Punkte und Linienzüge (Tracks). Polygone werden in Linienzüge umgewandelt',
				export_item_download_gpx: '.gpx',
				export_item_label_geojson: 'GeoJSON',
				export_item_description_geojson: 'übernimmt Stil (Symbol, Farbe und Strichstärke) und alle Geometrietypen',
				export_item_download_geojson: '.geojson',
				export_item_label_ewkt: 'EWKT',
				export_item_description_ewkt: 'übernimmt alle Geometrietypen, keine Stile',
				export_item_download_ewkt: '.txt',
				export_item_srid_selection: 'SRID auswählen',
				export_item_srid_selection_disabled: 'SRID ist vordefiniert'
			};

		default:
			return {};
	}
};
