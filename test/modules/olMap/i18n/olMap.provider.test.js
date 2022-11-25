import { provide } from '../../../../src/modules/olMap/i18n/olMap.provider';


describe('i18n for map module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.olMap_layer_not_available).toBe('Ebene konnte nicht geladen werden:');
		expect(map.olMap_handler_measure_start).toBe('Klicken, um die Messung zu beginnen');
		expect(map.olMap_handler_measure_continue_line).toBe('Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)');
		expect(map.olMap_handler_measure_continue_polygon).toBe('Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)');
		expect(map.olMap_handler_measure_snap_first_point).toBe('Klicke, um die Fläche zu schliessen');
		expect(map.olMap_handler_measure_snap_last_point).toBe('Klicke, um die Messung abzuschliessen');
		expect(map.olMap_handler_measure_modify_click_new_point).toBe('Klicke, um einen Punkt hinzuzufügen.<br/> Punkt verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_click_or_drag).toBe('Klicke, um den Punkt zu löschen.<br/> Punkt verschieben: klicken und ziehen');
		expect(map.olMap_handler_measure_modify_click_drag_overlay).toBe('Klicke und ziehen um die Beschriftung zu verschieben');
		expect(map.olMap_handler_measure_modify_key_for_delete).toBe('Messung löschen: ENTF Taste');
		expect(map.olMap_handler_draw_modify_key_for_delete).toBe('Zeichnung löschen: ENTF Taste');
		expect(map.olMap_handler_delete_last_point).toBe('Letzter Punkt löschen: ENTF Taste');
		expect(map.olMap_handler_measure_select).toBe('bestehende Messung auswählen oder neue Messung beginnen');
		expect(map.olMap_handler_measure_layer_label).toBe('Messung');
		expect(map.olMap_handler_draw_start).toBe('Klicken, um die Zeichnung zu beginnen');
		expect(map.olMap_handler_draw_layer_label).toBe('Zeichnung');
		expect(map.olMap_handler_draw_continue_line).toBe('Klicken, um die Linie zu zeichnen (Doppelklick zum Beenden)');
		expect(map.olMap_handler_draw_select).toBe('bestehende Zeichnung auswählen oder neue Zeichnung beginnen');
		expect(map.olMap_handler_draw_new_text).toBe('Neuer Text');
		expect(map.olMap_handler_storage_offline).toBe('Offline: Die Zeichnung kann nicht gespeichert werden. Die Daten werden nach der Sitzung gelöscht.');
		expect(map.olMap_handler_featureInfo_not_available).toBe('Objekt-Info nicht verfügbar');
		expect(map.olMap_handler_termsOfUse).toBe('Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den <a href="https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.');
		expect(map.olMap_handler_mfp_distortion_warning).toBe('Achtung! Die für den Export verwendete Projektion besitzt in den markierten Bereichen\nVerzerrungen die nicht für Längenmessungen geeignet sind.');
		expect(map.olMap_handler_mfp_id_a4_landscape).toBe('DIN A4 Querformat');
		expect(map.olMap_handler_mfp_id_a4_portrait).toBe('DIN A4 Hochformat');
		expect(map.olMap_handler_mfp_id_a3_landscape).toBe('DIN A3 Querformat');
		expect(map.olMap_handler_mfp_id_a3_portrait).toBe('DIN A3 Hochformat');
		expect(map.olMap_vectorLayerService_default_layer_name_vector).toBe('Daten');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.olMap_layer_not_available).toBe('Failed to add a layer for id');
		expect(map.olMap_handler_measure_start).toBe('Click to start measurement');
		expect(map.olMap_handler_measure_continue_line).toBe('Click to continue drawing the line (double-click to finish)');
		expect(map.olMap_handler_measure_continue_polygon).toBe('Click to continue drawing the polygon (double-click to finish)');
		expect(map.olMap_handler_measure_snap_first_point).toBe('Click to close the surface');
		expect(map.olMap_handler_measure_snap_last_point).toBe('Click to finish the line');
		expect(map.olMap_handler_measure_modify_click_new_point).toBe('Click, to add point<br/> Click then drag to move the point');
		expect(map.olMap_handler_measure_modify_click_or_drag).toBe('Click to delete the point.<br/> Click then drag to move the point');
		expect(map.olMap_handler_measure_modify_click_drag_overlay).toBe('Click then drag to move the label');
		expect(map.olMap_handler_measure_modify_key_for_delete).toBe('Press DEL to delete the measurement');
		expect(map.olMap_handler_draw_modify_key_for_delete).toBe('Press DEL to delete the drawing');
		expect(map.olMap_handler_delete_last_point).toBe('Press DEL to remove the last point drawn');
		expect(map.olMap_handler_measure_select).toBe('Select existing or start new measurement');
		expect(map.olMap_handler_measure_layer_label).toBe('Measurement');
		expect(map.olMap_handler_draw_start).toBe('Click to start drawing');
		expect(map.olMap_handler_draw_layer_label).toBe('Drawing');
		expect(map.olMap_handler_draw_continue_line).toBe('Click to continue drawing the line (double-click to finish)');
		expect(map.olMap_handler_draw_select).toBe('Select existing or start new drawing');
		expect(map.olMap_handler_draw_new_text).toBe('new text');
		expect(map.olMap_handler_storage_offline).toBe('Offline: Could not store layer-data. The data will get lost after this session.');
		expect(map.olMap_handler_featureInfo_not_available).toBe('Object Information not available');
		expect(map.olMap_handler_termsOfUse).toBe(''); // no termsOfUse in default/standalone-version
		expect(map.olMap_handler_mfp_distortion_warning).toBe('Attention! The projection used for export has distortions in the marked areas which are not suitable for length measurements.');
		expect(map.olMap_handler_mfp_id_a4_landscape).toBe('DIN A4 landscape');
		expect(map.olMap_handler_mfp_id_a4_portrait).toBe('DIN A4 portrait');
		expect(map.olMap_handler_mfp_id_a3_landscape).toBe('DIN A3 landscape');
		expect(map.olMap_handler_mfp_id_a3_portrait).toBe('DIN A3 portrait');
		expect(map.olMap_vectorLayerService_default_layer_name_vector).toBe('Data');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 28;
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
