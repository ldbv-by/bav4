import { provide } from '../../../../src/modules/olMap/i18n/olMap.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.olMap_handler_measure_start).toBe('Messung beginnen: klicken');
		expect(map.olMap_handler_measure_continue_line).toBe('Messlinie zeichnen: klicken<br/>beenden: Doppelklick');
		expect(map.olMap_handler_measure_continue_polygon).toBe('Fläche zeichnen: klicken<br/>beenden: Doppelklick');
		expect(map.olMap_handler_measure_snap_first_point).toBe('Fläche schließen: klicken');
		expect(map.olMap_handler_measure_snap_last_point).toBe('Messung abschließen: klicken');
		expect(map.olMap_handler_measure_modify_click_new_point).toBe('Punkt hinzufügen: klicken<br/>Punkt verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_click_or_drag).toBe('Punkt verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_polygon_click_or_drag).toBe('Punkt löschen: klicken<br/>Punkt verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_linestring_click_or_drag).toBe('Punkt löschen: klicken<br/>Punkt verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_click_drag_overlay).toBe('Beschriftung verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_key_for_delete).toBe('Messung löschen: ENTF-Taste');
		expect(map.olMap_handler_draw_modify_key_for_delete).toBe('Zeichnung löschen: ENTF-Taste');
		expect(map.olMap_handler_delete_last_point).toBe('Letzten Punkt löschen: ENTF-Taste');
		expect(map.olMap_handler_measure_select).toBe('bestehende Messung auswählen oder neue Messung beginnen');
		expect(map.olMap_handler_measure_layer_label).toBe('Messung');
		expect(map.olMap_handler_draw_start).toBe('Zeichnung beginnen: klicken');
		expect(map.olMap_handler_draw_layer_label).toBe('Zeichnung');
		expect(map.olMap_handler_draw_continue_line).toBe('Linie zeichnen: klicken<br/>Beenden: Doppelklick');
		expect(map.olMap_handler_draw_select).toBe('bestehende Zeichnung auswählen oder neue Zeichnung beginnen');
		expect(map.olMap_handler_draw_new_text).toBe('Neuer Text');
		expect(map.olMap_handler_storage_offline).toBe(
			'Offline: Die Zeichnung kann nicht gespeichert werden. Die Daten werden nach der Sitzung gelöscht.'
		);
		expect(map.olMap_handler_featureInfo_not_available).toBe('Objekt-Info nicht verfügbar');
		expect(map.olMap_handler_termsOfUse).toBe(
			'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den <a href="https://www.ldbv.bayern.de/file/pdf/18295/Nutzungsbedingungen_Geoportal_BayernAtlas_BayernAtlasplus.pdf" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.'
		);
		expect(map.olMap_handler_mfp_distortion_warning).toBe(
			'Die für den Export verwendete Projektion besitzt in einigen Bereichen\nVerzerrungen, die nicht für Längenmessungen geeignet sind.'
		);
		expect(map.olMap_handler_mfp_distortion_more_info).toBe('Mehr erfahren...');
		expect(map.olMap_handler_mfp_id_a4_landscape).toBe('DIN A4 Querformat');
		expect(map.olMap_handler_mfp_id_a4_portrait).toBe('DIN A4 Hochformat');
		expect(map.olMap_handler_mfp_id_a3_landscape).toBe('DIN A3 Querformat');
		expect(map.olMap_handler_mfp_id_a3_portrait).toBe('DIN A3 Hochformat');
		expect(map.olMap_handler_mfp_encoder_layer_not_exportable).toBe('Die folgenden Ebenen können nicht exportiert werden:');
		expect(map.olMap_handler_routing_choose_alternative_route(['label'])).toBe('label');
		expect(map.olMap_handler_routing_modify_segment).toBe('Ändern der Route: klicken und ziehen');
		expect(map.olMap_handler_routing_modify_start).toBe('Ändern des Startpunktes: klicken und ziehen');
		expect(map.olMap_handler_routing_modify_destination).toBe('Ändern des Zielpunktes: klicken und ziehen');
		expect(map.olMap_handler_routing_modify_intermediate).toBe('Ändern des Zwischenpunktes: klicken und ziehen');
		expect(map.olMap_handler_routing_rt_layer_label).toBe('Route (Track)');
		expect(map.olMap_handler_routing_wp_layer_label).toBe('Route (Wegpunkte)');
		expect(map.olMap_handler_routing_routingService_exception).toBe('Aufgrund eines technischen Fehlers konnte keine Route erstellt werden');
		expect(map.olMap_handler_routing_routingService_improper_waypoints).toBe(
			'Anhand der angegebenen Punkte konnte keine Route erstellt werden. Bitte passen Sie einen oder mehrere Punkte an.'
		);
		expect(map.olMap_vectorLayerService_default_layer_name_vector).toBe('Daten');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.olMap_handler_measure_start).toBe('Start measurement: click');
		expect(map.olMap_handler_measure_continue_line).toBe('Draw a line: continue clicking<br/>Finish line: double click');
		expect(map.olMap_handler_measure_continue_polygon).toBe('Draw a polygon: continue clicking<br/> finish: double-click');
		expect(map.olMap_handler_measure_snap_first_point).toBe('Close polygon: click');
		expect(map.olMap_handler_measure_snap_last_point).toBe('Finish measurement: click');
		expect(map.olMap_handler_measure_modify_click_new_point).toBe('Add point: click<br/>move point: click and drag');
		expect(map.olMap_handler_measure_modify_click_or_drag).toBe('Click then drag to move the point');
		expect(map.olMap_handler_measure_modify_polygon_click_or_drag).toBe('Delete point: click<br/>move point: click and drag');
		expect(map.olMap_handler_measure_modify_linestring_click_or_drag).toBe('Delete point: click<br/>move point: click and drag');
		expect(map.olMap_handler_measure_modify_click_drag_overlay).toBe('Move label: click and drag');
		expect(map.olMap_handler_measure_modify_key_for_delete).toBe('Delete measurement: press DEL');
		expect(map.olMap_handler_draw_modify_key_for_delete).toBe('Delete drawing: press DEL');
		expect(map.olMap_handler_delete_last_point).toBe('Delete last point drawn: press DEL');
		expect(map.olMap_handler_measure_select).toBe('Select existing or start new measurement');
		expect(map.olMap_handler_measure_layer_label).toBe('Measurement');
		expect(map.olMap_handler_draw_start).toBe('Start drawing: click');
		expect(map.olMap_handler_draw_layer_label).toBe('Drawing');
		expect(map.olMap_handler_draw_continue_line).toBe('Continue drawing: click<br/>finish drawing: double-click');
		expect(map.olMap_handler_draw_select).toBe('Select existing or start new drawing');
		expect(map.olMap_handler_draw_new_text).toBe('New text');
		expect(map.olMap_handler_storage_offline).toBe('Offline: Could not store layer-data. The data will get lost after this session.');
		expect(map.olMap_handler_featureInfo_not_available).toBe('Object Information not available');
		expect(map.olMap_handler_termsOfUse).toBe(''); // no termsOfUse in default/standalone-version
		expect(map.olMap_handler_mfp_distortion_warning).toBe(
			'The projection used for export has distortions in some areas which are not suitable for length measurements.'
		);
		expect(map.olMap_handler_mfp_distortion_more_info).toBe('More info...');
		expect(map.olMap_handler_mfp_id_a4_landscape).toBe('DIN A4 landscape');
		expect(map.olMap_handler_mfp_id_a4_portrait).toBe('DIN A4 portrait');
		expect(map.olMap_handler_mfp_id_a3_landscape).toBe('DIN A3 landscape');
		expect(map.olMap_handler_mfp_id_a3_portrait).toBe('DIN A3 portrait');
		expect(map.olMap_handler_mfp_encoder_layer_not_exportable).toBe('The following layers cannot be exported:');
		expect(map.olMap_handler_routing_choose_alternative_route(['label'])).toBe('label');
		expect(map.olMap_handler_routing_modify_segment).toBe('Modify route: click and pull');
		expect(map.olMap_handler_routing_modify_start).toBe('Modify starting point: click and pull');
		expect(map.olMap_handler_routing_modify_destination).toBe('Modify destination point: click and pull');
		expect(map.olMap_handler_routing_modify_intermediate).toBe('Modify waypoint: click and pull');
		expect(map.olMap_handler_routing_rt_layer_label).toBe('Route (Track)');
		expect(map.olMap_handler_routing_wp_layer_label).toBe('Route (Waypoints)');
		expect(map.olMap_handler_routing_routingService_exception).toBe('Due to a technical error no route could be created');
		expect(map.olMap_handler_routing_routingService_improper_waypoints).toBe(
			'No route could be created based on the given points. Please adjust one ore more points.'
		);
		expect(map.olMap_vectorLayerService_default_layer_name_vector).toBe('Data');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 40;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
