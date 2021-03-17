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
				map_olMap_handler_measure_modify_click_new_point:'Click, to add point<br/> Click then drag to move the point',
				map_olMap_handler_measure_modify_click_or_drag:'Click to delete the point.<br/> Click then drag to move the point',
				map_olMap_handler_measure_modify_key_for_delete:'Press DEL to delete the drawing',
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
				map_olMap_handler_measure_modify_click_new_point:'Klicke, um einen Punkt hinzuzufügen.<br/> Punkt verschieben: klicken und ziehen',
				map_olMap_handler_measure_modify_click_or_drag:'Klicke, um den Punkt zu löschen.<br/> Punkt verschieben: klicken und ziehen',
				map_olMap_handler_measure_modify_key_for_delete:'Zeichnung löschen: ENTF Taste',
				map_olMap_handler_delete_last_point:'Letzter Punkt löschen: ENTF Taste'
			};

		default:
			return {};
	}
};