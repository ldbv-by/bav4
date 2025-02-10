export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				info_geometryInfo_title_coordinate: 'Coordinate',
				info_geometryInfo_title_azimuth: 'Azimuth-angle',
				info_geometryInfo_title_line_length: 'Distance',
				info_geometryInfo_title_polygon_length: 'Perimeter',
				info_geometryInfo_title_polygon_area: 'Area'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				info_geometryInfo_title_coordinate: 'Koordinate',
				info_geometryInfo_title_azimuth: 'Azimuth-Winkel',
				info_geometryInfo_title_line_length: 'Länge',
				info_geometryInfo_title_polygon_length: 'Umfang',
				info_geometryInfo_title_polygon_area: 'Fläche'
			};

		default:
			return {};
	}
};
