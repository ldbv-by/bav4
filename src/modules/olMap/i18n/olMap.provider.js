export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				olMap_handler_measure_start: 'Start measurement: click',
				olMap_handler_measure_continue_line: 'Draw a line: continue clicking<br/>Finish line: double click',
				olMap_handler_measure_continue_polygon: 'Draw a polygon: continue clicking<br/> finish: double-click',
				olMap_handler_measure_snap_first_point: 'Close polygon: click',
				olMap_handler_measure_snap_last_point: 'Finish measurement: click',
				olMap_handler_measure_modify_click_new_point: 'Add point: click<br/>move point: click and drag',
				olMap_handler_measure_modify_click_or_drag: 'Click then drag to move the point',
				olMap_handler_measure_modify_polygon_click_or_drag: 'Delete point: click<br/>move point: click and drag',
				olMap_handler_measure_modify_linestring_click_or_drag: 'Delete point: click<br/>move point: click and drag',
				olMap_handler_measure_modify_click_drag_overlay: 'Move label: click and drag',
				olMap_handler_measure_modify_key_for_delete: 'Delete measurement: press DEL',
				olMap_handler_draw_modify_key_for_delete: 'Delete drawing: press DEL',
				olMap_handler_delete_last_point: 'Delete last point drawn: press DEL',
				olMap_handler_measure_select: 'Select existing or start new measurement',
				olMap_handler_measure_layer_label: 'Measurement',
				olMap_handler_draw_start: 'Start drawing: click',
				olMap_handler_draw_layer_label: 'Drawing',
				olMap_handler_draw_continue_line: 'Continue drawing: click<br/>finish drawing: double-click',
				olMap_handler_draw_select: 'Select existing or start new drawing',
				olMap_handler_draw_new_text: 'New text',
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
				olMap_handler_routing_modify_segment: 'Modify route: click and pull',
				olMap_handler_routing_modify_start: 'Modify starting point: click and pull',
				olMap_handler_routing_modify_destination: 'Modify destination point: click and pull',
				olMap_handler_routing_modify_intermediate: 'Modify waypoint: click and pull',
				olMap_handler_routing_rt_layer_label: 'Route (Track)',
				olMap_handler_routing_wp_layer_label: 'Route (Waypoints)',
				olMap_handler_routing_routingService_exception: 'Due to a technical error no route could be created',
				olMap_handler_routing_routingService_improper_waypoints:
					'No route could be created based on the given points. Please adjust one ore more points.',
				olMap_vectorLayerService_default_layer_name_vector: 'Data'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				olMap_handler_measure_start: 'Messung beginnen: klicken',
				olMap_handler_measure_continue_line: 'Messlinie zeichnen: klicken<br/>beenden: Doppelklick',
				olMap_handler_measure_continue_polygon: 'Fläche zeichnen: klicken<br/>beenden: Doppelklick',
				olMap_handler_measure_snap_first_point: 'Fläche schließen: klicken',
				olMap_handler_measure_snap_last_point: 'Messung abschließen: klicken',
				olMap_handler_measure_modify_click_new_point: 'Punkt hinzufügen: klicken<br/>Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_click_or_drag: 'Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_polygon_click_or_drag: 'Punkt löschen: klicken<br/>Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_linestring_click_or_drag: 'Punkt löschen: klicken<br/>Punkt verschieben: klicken und ziehen',
				olMap_handler_measure_modify_click_drag_overlay: 'Beschriftung verschieben: klicken und ziehen',
				olMap_handler_measure_modify_key_for_delete: 'Messung löschen: ENTF-Taste',
				olMap_handler_draw_modify_key_for_delete: 'Zeichnung löschen: ENTF-Taste',
				olMap_handler_delete_last_point: 'Letzten Punkt löschen: ENTF-Taste',
				olMap_handler_measure_select: 'bestehende Messung auswählen oder neue Messung beginnen',
				olMap_handler_measure_layer_label: 'Messung',
				olMap_handler_draw_start: 'Zeichnung beginnen: klicken',
				olMap_handler_draw_layer_label: 'Zeichnung',
				olMap_handler_draw_continue_line: 'Linie zeichnen: klicken<br/>Beenden: Doppelklick',
				olMap_handler_draw_select: 'bestehende Zeichnung auswählen oder neue Zeichnung beginnen',
				olMap_handler_draw_new_text: 'Neuer Text',
				olMap_handler_storage_offline: 'Offline: Die Zeichnung kann nicht gespeichert werden. Die Daten werden nach der Sitzung gelöscht.',
				olMap_handler_featureInfo_not_available: 'Objekt-Info nicht verfügbar',
				olMap_handler_termsOfUse:
					'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den <a href="https://www.ldbv.bayern.de/file/pdf/18295/Nutzungsbedingungen_Geoportal_BayernAtlas_BayernAtlasplus.pdf" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.',
				olMap_handler_mfp_distortion_warning:
					'Die für den Export verwendete Projektion besitzt in einigen Bereichen\nVerzerrungen, die nicht für Längenmessungen geeignet sind.',
				olMap_handler_mfp_distortion_more_info: 'Mehr erfahren...',
				olMap_handler_mfp_id_a4_landscape: 'DIN A4 Querformat',
				olMap_handler_mfp_id_a4_portrait: 'DIN A4 Hochformat',
				olMap_handler_mfp_id_a3_landscape: 'DIN A3 Querformat',
				olMap_handler_mfp_id_a3_portrait: 'DIN A3 Hochformat',
				olMap_handler_mfp_encoder_layer_not_exportable: 'Die folgenden Ebenen können nicht exportiert werden:',
				olMap_handler_routing_choose_alternative_route: (params) => `${params[0]}`,
				olMap_handler_routing_modify_segment: 'Ändern der Route: klicken und ziehen',
				olMap_handler_routing_modify_start: 'Ändern des Startpunktes: klicken und ziehen',
				olMap_handler_routing_modify_destination: 'Ändern des Zielpunktes: klicken und ziehen',
				olMap_handler_routing_modify_intermediate: 'Ändern des Zwischenpunktes: klicken und ziehen',
				olMap_handler_routing_rt_layer_label: 'Route (Track)',
				olMap_handler_routing_wp_layer_label: 'Route (Wegpunkte)',
				olMap_handler_routing_routingService_exception: 'Aufgrund eines technischen Fehlers konnte keine Route erstellt werden',
				olMap_handler_routing_routingService_improper_waypoints:
					'Anhand der angegebenen Punkte konnte keine Route erstellt werden. Bitte passen Sie einen oder mehrere Punkte an.',
				olMap_vectorLayerService_default_layer_name_vector: 'Daten'
			};

		default:
			return {};
	}
};
