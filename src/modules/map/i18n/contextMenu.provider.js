export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_contextMenu_header: 'Location',					
				map_contextMenu_close_button: 'Close',
				map_olMap_handler_contextMenu_content_altitude_label: 'Altitude'				
			};
			
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_contextMenu_header: 'Position',								
				map_contextMenu_close_button: 'Schließen',
				map_olMap_handler_contextMenu_content_altitude_label: 'Höhe'			
			};

		default:
			return {};
	}
};