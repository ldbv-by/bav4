export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module				
				map_olMap_handler_measure_start:'Click to start measurement',				
				map_olMap_handler_measure_continue_line: 'Click to continue drawing the line (double-click to finish)',
				map_olMap_handler_measure_continue_polygon:'Click to continue drawing the polygon (double-click to finish)',
				map_olMap_handler_measure_snap_first_point:'Click to close the surface',
				map_olMap_handler_measure_snap_last_point:'Click to finish the line',
				map_olMap_handler_delete_last_point:'Press DEL to remove the last point drawn'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module				
				map_olMap_handler_measure_start:'Klicken, um die Messung zu beginnen',
				map_olMap_handler_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)',			
				map_olMap_handler_measure_continue_polygon:'Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)',
				map_olMap_handler_measure_snap_first_point:'Klicke, um die Fläche zu schliessen',
				map_olMap_handler_measure_snap_last_point:'Klicke, um die Messung abzuschliessen',
				map_olMap_handler_delete_last_point:'Letzter Punkt löschen: ENTF Taste'
			};

		default:
			return {};
	}
};