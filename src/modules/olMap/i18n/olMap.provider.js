export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				olMap_layer_not_available: 'Failed to add a layer for id',
				olMap_handler_measure_start: 'Click to start measurement',
				olMap_handler_measure_continue_line: 'Click to continue drawing the line (double-click to finish)',
				olMap_handler_measure_continue_polygon: 'Click to continue drawing the polygon (double-click to finish)',
				olMap_handler_measure_snap_first_point: 'Click to close the surface',
				olMap_handler_measure_snap_last_point: 'Click to finish the line',
				olMap_handler_measure_modify_click_new_point: 'Click, to add point<br/> Click then drag to move the point',
				olMap_handler_measure_modify_click_or_drag: 'Click to delete the point.<br/> Click then drag to move the point',
				olMap_handler_measure_modify_click_drag_overlay: 'Click then drag to move the label',
				olMap_handler_measure_modify_key_for_delete: 'Press DEL to delete the measurement',
				olMap_handler_draw_modify_key_for_delete: 'Press DEL to delete the drawing',
				olMap_handler_delete_last_point: 'Press DEL to remove the last point drawn',
				olMap_handler_measure_select: 'Select existing or start new measurement',
				olMap_handler_measure_layer_label: 'Measurement',
				olMap_handler_draw_start: 'Click to start drawing',
				olMap_handler_draw_layer_label: 'Drawing',
				olMap_handler_draw_continue_line: 'Click to continue drawing the line (double-click to finish)',
				olMap_handler_draw_select: 'Select existing or start new drawing',
				olMap_handler_draw_new_text: 'new text',
				olMap_handler_storage_offline: 'Offline: Could not store layer-data. The data will get lost after this session.',
				map_olMap_handler_featureInfo_not_available: 'Object Information not available',
				map_olMap_handler_termsOfUse: '' // no termsOfUse in default/standalone-version
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				olMap_layer_not_available: 'Ebene konnt nicht geladen werden:',
				olMap_handler_measure_start: 'Klicken, um die Messung zu beginnen',
				olMap_handler_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)',
				olMap_handler_measure_continue_polygon: 'Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)',
				olMap_handler_measure_snap_first_point: 'Klicke, um die Fläche zu schliessen',
				olMap_handler_measure_snap_last_point: 'Klicke, um die Messung abzuschliessen',
				olMap_handler_measure_modify_click_new_point: 'Klicke, um einen Punkt hinzuzufügen.<br/> Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_click_or_drag: 'Klicke, um den Punkt zu löschen.<br/> Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_click_drag_overlay: 'Klicke und ziehen um die Beschriftung zu verschieben',
				olMap_handler_measure_modify_key_for_delete: 'Messung löschen: ENTF Taste',
				olMap_handler_draw_modify_key_for_delete: 'Zeichnung löschen: ENTF Taste',
				olMap_handler_delete_last_point: 'Letzter Punkt löschen: ENTF Taste',
				olMap_handler_measure_select: 'bestehende Messung auswählen oder neue Messung beginnen',
				olMap_handler_measure_layer_label: 'Messung',
				olMap_handler_draw_start: 'Klicken, um die Zeichnung zu beginnen',
				olMap_handler_draw_layer_label: 'Zeichnung',
				olMap_handler_draw_continue_line: 'Klicken, um die Linie zu zeichnen (Doppelklick zum Beenden)',
				olMap_handler_draw_select: 'bestehende Zeichnung auswählen oder neue Zeichnung beginnen',
				olMap_handler_draw_new_text: 'Neuer Text',
				olMap_handler_storage_offline: 'Offline: Die Zeichnung kann nicht gespeichert werden. Die Daten werden nach der Sitzung gelöscht.',
				map_olMap_handler_featureInfo_not_available: 'Objekt-Info nicht verfügbar',
				map_olMap_handler_termsOfUse: 'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den <a href="https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.'
			};

		default:
			return {};
	}
};
