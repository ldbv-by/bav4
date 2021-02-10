export const olMeasurementHandlerProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module				
				draw_measure_start:'Click to start measurement',
				draw_measure_continue_line: 'Click to continue drawing the line',
				draw_measure_continue_polygon:'Click to continue drawing the polygon',
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module				
				draw_measure_start:'Klicken, um die Messung zu beginnen',
				draw_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen',			
				draw_measure_continue_polygon:'Klicken, um die Fläche zu zeichnen',
			};

		default:
			return {};
	}
};