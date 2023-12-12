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
				olMap_handler_measure_modify_click_or_drag: 'Click then drag to move the point',
				olMap_handler_measure_modify_polygon_click_or_drag: 'Click to delete the point (3 points min.).<br/> Click then drag to move the point',
				olMap_handler_measure_modify_linestring_click_or_drag: 'Click to delete the point (2 points min.).<br/> Click then drag to move the point',
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
				olMap_handler_featureInfo_not_available: 'Object Information not available',
				olMap_handler_termsOfUse: '', // no termsOfUse in default/standalone-version
				olMap_handler_mfp_distortion_warning:
					'The projection used for export has distortions in some areas which are not suitable for length measurements.',
				olMap_handler_mfp_distortion_more_info: 'More info...',
				olMap_handler_mfp_id_a4_landscape: 'DIN A4 landscape',
				olMap_handler_mfp_id_a4_portrait: 'DIN A4 portrait',
				olMap_handler_mfp_id_a3_landscape: 'DIN A3 landscape',
				olMap_handler_mfp_id_a3_portrait: 'DIN A3 portrait',
				olMap_handler_mfp_encoder_layer_not_exportable: 'The following layers cannot be exported:',
				olMap_handler_routing_choose_alternative_route: (params) => `${params[0]}`,
				olMap_handler_routing_modify_segment: 'Pull to modify the route',
				olMap_handler_routing_modify_start: 'Pull to modify the start point',
				olMap_handler_routing_modify_destination: 'Pull to modify the destination point',
				olMap_handler_routing_modify_intermediate: 'Pull to modify the waypoint',
				olMap_vectorLayerService_default_layer_name_vector: 'Data'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				olMap_layer_not_available: 'Ebene konnte nicht geladen werden:',
				olMap_handler_measure_start: 'Klicken, um die Messung zu beginnen',
				olMap_handler_measure_continue_line: 'Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)',
				olMap_handler_measure_continue_polygon: 'Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)',
				olMap_handler_measure_snap_first_point: 'Klicke, um die Fläche zu schliessen',
				olMap_handler_measure_snap_last_point: 'Klicke, um die Messung abzuschliessen',
				olMap_handler_measure_modify_click_new_point: 'Klicke, um einen Punkt hinzuzufügen.<br/> Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_click_or_drag: 'Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_polygon_click_or_drag:
					'Klicke, um den Punkt zu löschen (mind. 3 Punkte).<br/> Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_linestring_click_or_drag:
					'Klicke, um den Punkt zu löschen (mind. 2 Punkte).<br/> Punkt verschieben: klicken und ziehen',
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
				olMap_handler_featureInfo_not_available: 'Objekt-Info nicht verfügbar',
				olMap_handler_termsOfUse:
					'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den <a href="https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.',
				olMap_handler_mfp_distortion_warning:
					'Die für den Export verwendete Projektion besitzt in einigen Bereichen\nVerzerrungen, die nicht für Längenmessungen geeignet sind.',
				olMap_handler_mfp_distortion_more_info: 'Mehr erfahren...',
				olMap_handler_mfp_id_a4_landscape: 'DIN A4 Querformat',
				olMap_handler_mfp_id_a4_portrait: 'DIN A4 Hochformat',
				olMap_handler_mfp_id_a3_landscape: 'DIN A3 Querformat',
				olMap_handler_mfp_id_a3_portrait: 'DIN A3 Hochformat',
				olMap_handler_mfp_encoder_layer_not_exportable: 'Die folgenden Ebenen können nicht exportiert werden:',
				olMap_handler_routing_choose_alternative_route: (params) => `${params[0]}`,
				olMap_handler_routing_modify_segment: 'Zum Ändern der Route ziehen',
				olMap_handler_routing_modify_start: 'Zum Ändern des Startpunktes ziehen',
				olMap_handler_routing_modify_destination: 'Zum Ändern des Zielpunktes ziehen',
				olMap_handler_routing_modify_intermediate: 'Zum Ändern des Zwischenpunktes ziehen',
				olMap_vectorLayerService_default_layer_name_vector: 'Daten'
			};

		default:
			return {};
	}
};
