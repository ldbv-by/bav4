import { provide } from '../../../../src/modules/map/i18n/olMap.provider';


describe('i18n for map module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_olMap_handler_measure_start).toBe('Klicken, um die Messung zu beginnen');
		expect(map.map_olMap_handler_measure_continue_line).toBe('Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)');
		expect(map.map_olMap_handler_measure_continue_polygon).toBe('Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)');
		expect(map.map_olMap_handler_measure_snap_first_point).toBe('Klicke, um die Fläche zu schliessen');
		expect(map.map_olMap_handler_measure_snap_last_point).toBe('Klicke, um die Messung abzuschliessen');
		expect(map.map_olMap_handler_measure_modify_click_new_point).toBe('Klicke, um einen Punkt hinzuzufügen.<br/> Punkt verschieben: klicken und ziehen');
		expect(map.map_olMap_handler_measure_modify_click_or_drag).toBe('Klicke, um den Punkt zu löschen.<br/> Punkt verschieben: klicken und ziehen');
		expect(map.map_olMap_handler_measure_modify_click_drag_overlay).toBe('Klicke und ziehen um die Beschriftung zu verschieben');
		expect(map.map_olMap_handler_measure_modify_key_for_delete).toBe('Zeichnung löschen: ENTF Taste');
		expect(map.map_olMap_handler_delete_last_point).toBe('Letzter Punkt löschen: ENTF Taste');
		expect(map.map_olMap_handler_measure_select).toBe('bestehende Messung auswählen oder neue Messung beginnen');
		expect(map.map_olMap_handler_measure_layer_label).toBe('Messung');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.map_olMap_handler_measure_start).toBe('Click to start measurement');
		expect(map.map_olMap_handler_measure_continue_line).toBe('Click to continue drawing the line (double-click to finish)');
		expect(map.map_olMap_handler_measure_continue_polygon).toBe('Click to continue drawing the polygon (double-click to finish)');
		expect(map.map_olMap_handler_measure_snap_first_point).toBe('Click to close the surface');
		expect(map.map_olMap_handler_measure_snap_last_point).toBe('Click to finish the line');
		expect(map.map_olMap_handler_measure_modify_click_new_point).toBe('Click, to add point<br/> Click then drag to move the point');
		expect(map.map_olMap_handler_measure_modify_click_or_drag).toBe('Click to delete the point.<br/> Click then drag to move the point');
		expect(map.map_olMap_handler_measure_modify_click_drag_overlay).toBe('Click then drag to move the label');
		expect(map.map_olMap_handler_measure_modify_key_for_delete).toBe('Press DEL to delete the drawing');
		expect(map.map_olMap_handler_delete_last_point).toBe('Press DEL to remove the last point drawn');
		expect(map.map_olMap_handler_measure_select).toBe('Select existing or start new measurement');
		expect(map.map_olMap_handler_measure_layer_label).toBe('Measurement');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 12;
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