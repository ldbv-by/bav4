export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item_label_kml: 'KML',
				export_item_description_kml: 'Saves attributes, styles (symbols, color and width) and all geometry types.',
				export_item_download_kml: 'Download KML',
				export_item_label_gpx: 'GPX',
				export_item_description_gpx: 'Saves points and linestrings (tracks). Polygons are converted to linestrings.',
				export_item_download_gpx: 'Download GPX',
				export_item_label_geojson: 'GeoJSON',
				export_item_description_geojson: 'Saves attributes and all geometry types, but no styles.',
				export_item_download_geojson: 'Download GeoJSON',
				export_item_label_ewkt: 'EWKT',
				export_item_description_ewkt: 'Saves all geometry types, but no styles.',
				export_item_download_ewkt: 'Download TXT',
				export_item_srid_selection: 'Select SRID',
				export_item_srid_selection_disabled: 'SRID is predefined',
				export_item_copy_to_clipboard: (params) => `Copy ${params[0]} to clipboard`,
				export_item_clipboard_success: 'The data was copied to the clipboard',
				export_item_clipboard_error: '"Copy to clipboard" is not available'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item_label_kml: 'KML',
				export_item_description_kml: 'Übernimmt Attribute, Stil (Symbol, Farbe und Strichstärke) und alle Geometrietypen.',
				export_item_download_kml: 'Download KML',
				export_item_label_gpx: 'GPX',
				export_item_description_gpx: 'Übernimmt Punkte und Linienzüge (Tracks). Polygone werden in Linienzüge umgewandelt.',
				export_item_download_gpx: 'Download GPX',
				export_item_label_geojson: 'GeoJSON',
				export_item_description_geojson: 'Übernimmt Attribute und alle Geometrietypen, aber keine Stile.',
				export_item_download_geojson: 'Download GeoJSON',
				export_item_label_ewkt: 'EWKT',
				export_item_description_ewkt: 'Übernimmt alle Geometrietypen, aber keine Stile.',
				export_item_download_ewkt: 'Download TXT',
				export_item_srid_selection: 'SRID auswählen',
				export_item_srid_selection_disabled: 'SRID ist vordefiniert',
				export_item_copy_to_clipboard: (params) => `${params[0]} in die Zwischenablage kopieren`,
				export_item_clipboard_success: 'Die Daten wurden in die Zwischenablage kopiert',
				export_item_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung'
			};

		default:
			return {};
	}
};
