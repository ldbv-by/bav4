export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_olMap_handler_measure_start: 'Click to start measurement',
				map_olMap_handler_measure_continue_line: 'Click to continue drawing the line (double-click to finish)',
				map_olMap_handler_measure_continue_polygon: 'Click to continue drawing the polygon (double-click to finish)',
				map_olMap_handler_measure_snap_first_point: 'Click to close the surface',
				map_olMap_handler_measure_snap_last_point: 'Click to finish the line',
				map_olMap_handler_measure_modify_click_new_point: 'Click, to add point<br/> Click then drag to move the point',
				map_olMap_handler_measure_modify_click_or_drag: 'Click to delete the point.<br/> Click then drag to move the point',
				map_olMap_handler_measure_modify_click_drag_overlay: 'Click then drag to move the label',
				map_olMap_handler_measure_modify_key_for_delete: 'Press DEL to delete the measurement',
				map_olMap_handler_draw_modify_key_for_delete: 'Press DEL to delete the drawing',
				map_olMap_handler_delete_last_point: 'Press DEL to remove the last point drawn',
				map_olMap_handler_measure_select: 'Select existing or start new measurement',
				map_olMap_handler_measure_layer_label: 'Measurement',
				map_olMap_handler_draw_start: 'Click to start drawing',
				map_olMap_handler_draw_layer_label: 'Drawing',
				map_olMap_handler_draw_continue_line: 'Click to continue drawing the line (double-click to finish)',
				map_olMap_handler_draw_select: 'Select existing or start new drawing',
				map_olMap_handler_storage_offline: 'Offline: Could not store layer-data. The data will get lost after this session.',
				map_olMap_handler_featureInfo_not_available: 'Object Information not available',
				map_olMap_handler_termsOfUse: '' // no termsOfUse in default/standalone-version
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_olMap_handler_measure_start: 'Klicken, um die Messung zu beginnen',
				map_olMap_handler_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)',
				map_olMap_handler_measure_continue_polygon: 'Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)',
				map_olMap_handler_measure_snap_first_point: 'Klicke, um die Fläche zu schliessen',
				map_olMap_handler_measure_snap_last_point: 'Klicke, um die Messung abzuschliessen',
				map_olMap_handler_measure_modify_click_new_point: 'Klicke, um einen Punkt hinzuzufügen.<br/> Punkt verschieben: klicken und ziehen',
				map_olMap_handler_measure_modify_click_or_drag: 'Klicke, um den Punkt zu löschen.<br/> Punkt verschieben: klicken und ziehen',
				map_olMap_handler_measure_modify_click_drag_overlay: 'Klicke und ziehen um die Beschriftung zu verschieben',
				map_olMap_handler_measure_modify_key_for_delete: 'Messung löschen: ENTF Taste',
				map_olMap_handler_draw_modify_key_for_delete: 'Zeichnung löschen: ENTF Taste',
				map_olMap_handler_delete_last_point: 'Letzter Punkt löschen: ENTF Taste',
				map_olMap_handler_measure_select: 'bestehende Messung auswählen oder neue Messung beginnen',
				map_olMap_handler_measure_layer_label: 'Messung',
				map_olMap_handler_draw_start: 'Klicken, um die Zeichnung zu beginnen',
				map_olMap_handler_draw_layer_label: 'Zeichnung',
				map_olMap_handler_draw_continue_line: 'Klicken, um die Linie zu zeichnen (Doppelklick zum Beenden)',
				map_olMap_handler_draw_select: 'bestehende Zeichnung auswählen oder neue Zeichnung beginnen',
				map_olMap_handler_storage_offline: 'Offline: Die Zeichnung kann nicht gespeichert werden. Die Daten werden nach der Sitzung gelöscht.',
				map_olMap_handler_featureInfo_not_available: 'Objekt-Info nicht verfügbar',
				map_olMap_handler_termsOfUse: 'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den <a href="https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.'
			};

		default:
			return {};
	}
};
