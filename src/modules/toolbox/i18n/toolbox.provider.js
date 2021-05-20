export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				toolbox_drawTool_header: 'Draw',
				toolbox_drawTool_symbol: 'Symbol',
				toolbox_drawTool_text: 'Text',
				toolbox_drawTool_line: 'Line',
				toolbox_drawTool_polygon: 'Polygon',
				toolbox_drawTool_share: 'Share',
				toolbox_drawTool_save: 'Save',
				toolbox_drawTool_info: 'Your drawing will be automatically saved for one year. By using this service you agree to the terms of use.',
				toolbox_measureTool_header: 'Measure',
				toolbox_measureTool_measure: 'Measure',
				toolbox_measureTool_stats_length: 'Length',
				toolbox_measureTool_stats_area: 'Area',
				toolbox_measureTool_start_new: 'Start New',
				toolbox_measureTool_delete_point:'Delete last point',
				toolbox_measureTool_delete_measure:'Delete measure',
				toolbox_measureTool_measure_active:'Click in the map to start measurement.',
				toolbox_measureTool_measure_draw: 'Click in the map to continue drawing the line (double-click to finish).',
				toolbox_measureTool_measure_modify: 'Click on the measurement, to add point;</br> Click then drag to move the point;</br> Single click on the point to delete.',
				toolbox_measureTool_measure_select: 'Select existing or start new measurement',
				toolbox_drawTool_finish:'Finish'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				toolbox_drawTool_header: 'Zeichnen',
				toolbox_drawTool_symbol: 'Symbol',
				toolbox_drawTool_text: 'Text',
				toolbox_drawTool_line: 'Linie',
				toolbox_drawTool_polygon: 'Polygon',
				toolbox_drawTool_share: 'Teilen',
				toolbox_drawTool_save: 'Speichern',
				toolbox_drawTool_info: 'Ihre Zeichnung wird automatisch für ein Jahr gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.',
				toolbox_measureTool_header: 'Messen',
				toolbox_measureTool_measure: 'Messen',
				toolbox_measureTool_stats_length: 'Länge',
				toolbox_measureTool_stats_area: 'Fläche',
				toolbox_measureTool_start_new: 'Neue Messung',
				toolbox_measureTool_delete_point: 'letzten Punkt löschen',
				toolbox_measureTool_delete_measure: 'Messung löschen',
				toolbox_measureTool_measure_active: 'In die Karte klicken, um die Messung zu beginnen.',
				toolbox_measureTool_measure_draw: 'In die Karte klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden).',
				toolbox_measureTool_measure_modify: 'Klicke auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: klicken und ziehen;</br> Punkt löschen: auf Punkt klicken',
				toolbox_measureTool_measure_select: 'Eine bestehende Messung auswählen oder eine neue Messung beginnen.',
				toolbox_drawTool_finish:'Fertig'
			};

		default:
			return {};
	}
};