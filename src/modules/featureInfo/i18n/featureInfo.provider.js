export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Close',
				featureInfo_header: 'Object Information',
				geometryInfo_title_coordinate: 'Coordinate',
				geometryInfo_title_azimuth: 'Azimuth-angle',
				geometryInfo_title_line_length: 'Distance',
				geometryInfo_title_polygon_length: 'Perimeter',
				geometryInfo_title_polygon_area: 'Area'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Schließen',
				featureInfo_header: 'Objekt-Info',
				geometryInfo_title_coordinate: 'Koordinate',
				geometryInfo_title_azimuth: 'Azimuth-Winkel',
				geometryInfo_title_line_length: 'Länge',
				geometryInfo_title_polygon_length: 'Umfang',
				geometryInfo_title_polygon_area: 'Fläche'
			};

		default:
			return {};
	}
};
