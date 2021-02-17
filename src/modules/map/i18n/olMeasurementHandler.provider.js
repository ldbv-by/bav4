export const olMeasurementHandlerProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module				
				draw_measure_start:'Click to start measurement',
				draw_measure_continue_line: 'Click to continue drawing the line (double-click to finish)',
				draw_measure_continue_polygon:'Click to continue drawing the polygon (double-click to finish)',
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module				
				draw_measure_start:'Klicken, um die Messung zu beginnen',
				draw_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)',			
				draw_measure_continue_polygon:'Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)',
			};

		default:
			return {};
	}
};