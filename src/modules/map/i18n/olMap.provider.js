export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_zoom_in_button: 'Zoom in',
				map_zoom_out_button: 'Zoom out',
				map_info_button: 'Information',
				map_info_button_help: 'Help',
				map_info_button_contact: 'Contact',
				map_info_button_about: 'About us',
				map_zoom_extent_button: 'Zoom to full extent',
				map_context_menu_content_icon: 'Copy to clipboard',
				map_measure_start:'Click to start measurement',
				map_measure_continue_line: 'Click to continue drawing the line (double-click to finish)',
				map_measure_continue_polygon:'Click to continue drawing the polygon (double-click to finish)',
				map_measure_snap_first_point:'Click to close the surface',
				map_measure_snap_last_point:'Click to finish the line',
				map_delete_last_point:'Press DEL to remove the last point drawn'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_zoom_in_button: 'Vergrößere Kartenausschnitt',
				map_zoom_out_button: 'Verkleinere Kartenausschnitt',
				map_info_button: 'Information',
				map_info_button_help: 'Hilfe',
				map_info_button_contact: 'Kontakt',
				map_info_button_about: 'Impressum',
				map_zoom_extent_button: 'Ganz Bayern anzeigen',
				map_context_menu_content_icon: 'In die Zwischenablage kopieren',
				map_measure_start:'Klicken, um die Messung zu beginnen',
				map_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)',			
				map_measure_continue_polygon:'Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)',
				map_measure_snap_first_point:'Klicke, um die Fläche zu schliessen',
				map_measure_snap_last_point:'Klicke, um die Messung abzuschliessen',
				map_delete_last_point:'Letzter Punkt löschen: ENTF Taste'
			};

		default:
			return {};
	}
};