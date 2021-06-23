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
				toolbox_measureTool_delete_point: 'Delete last point',
				toolbox_measureTool_delete_measure: 'Delete measure',
				toolbox_measureTool_measure_active: 'Tap on the map to start measurement',
				toolbox_measureTool_measure_draw: 'Tap on the map to continue drawing the line (double-tap to finish)',
				toolbox_measureTool_measure_modify: 'To add a point, tap on a measurement;</br> To move a point, press and drag it;</br> To delete a point, tap on it',
				toolbox_measureTool_measure_select: 'Select an existing measurement or start a new one',
				toolbox_measureTool_share: 'Share',
				toolbox_measureTool_share_link_readonly: 'Link to share your measurement',
				toolbox_measureTool_share_link_edit: 'Link to editable share your measurement',
				toolbox_measureTool_share_link_title: 'shared with BayernAtlas.de',
				toolbox_drawTool_finish: 'Finish'
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
				toolbox_measureTool_measure_active: 'In die Karte tippen, um die Messung zu beginnen',
				toolbox_measureTool_measure_draw: 'In die Karte tippen, um die Messlinie zu zeichnen (Doppelt tippen zum Beenden)',
				toolbox_measureTool_measure_modify: 'Tippe auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen',
				toolbox_measureTool_measure_select: 'Eine bestehende Messung auswählen oder eine neue Messung beginnen',
				toolbox_measureTool_share: 'Teilen',
				toolbox_measureTool_share_link_readonly: 'Link zum Teilen Ihrer Zeichnung',
				toolbox_measureTool_share_link_edit: 'Link zum Editieren Ihrer Zeichnung',
				toolbox_measureTool_share_link_title: 'geteilt über BayernAtlas.de',
				toolbox_drawTool_finish: 'Fertig'
			};

		default:
			return {};
	}
};