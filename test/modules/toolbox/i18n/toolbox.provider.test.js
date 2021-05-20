import { provide } from '../../../../src/modules/toolbox/i18n/toolbox.provider';


describe('i18n for menu module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.toolbox_drawTool_header).toBe('Zeichnen');
		expect(map.toolbox_drawTool_symbol).toBe('Symbol');
		expect(map.toolbox_drawTool_text).toBe('Text');
		expect(map.toolbox_drawTool_line).toBe('Linie');
		expect(map.toolbox_drawTool_polygon).toBe('Polygon');
		expect(map.toolbox_drawTool_share).toBe('Teilen');
		expect(map.toolbox_drawTool_save).toBe('Speichern');
		expect(map.toolbox_drawTool_info).toBe('Ihre Zeichnung wird automatisch für ein Jahr gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.');
		expect(map.toolbox_measureTool_header).toBe('Messen');
		expect(map.toolbox_measureTool_measure).toBe('Messen');
		expect(map.toolbox_measureTool_stats_length).toBe('Länge');
		expect(map.toolbox_measureTool_stats_area).toBe('Fläche');
		expect(map.toolbox_measureTool_start_new).toBe('Neue Messung');
		expect(map.toolbox_measureTool_delete_point).toBe('letzten Punkt löschen');
		expect(map.toolbox_measureTool_delete_measure).toBe('Messung löschen');
		expect(map.toolbox_measureTool_measure_active).toBe('In die Karte tippen, um die Messung zu beginnen.');
		expect(map.toolbox_measureTool_measure_draw).toBe('In die Karte tippen, um die Messlinie zu zeichnen (Doppelt tippen zum Beenden).');
		expect(map.toolbox_measureTool_measure_modify).toBe('Tippe auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen');
		expect(map.toolbox_measureTool_measure_select).toBe('Eine bestehende Messung auswählen oder eine neue Messung beginnen.');
		expect(map.toolbox_drawTool_finish).toBe('Fertig');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.toolbox_drawTool_header).toBe('Draw');
		expect(map.toolbox_drawTool_symbol).toBe('Symbol');
		expect(map.toolbox_drawTool_text).toBe('Text');
		expect(map.toolbox_drawTool_line).toBe('Line');
		expect(map.toolbox_drawTool_polygon).toBe('Polygon');		
		expect(map.toolbox_drawTool_share).toBe('Share');
		expect(map.toolbox_drawTool_save).toBe('Save');
		expect(map.toolbox_drawTool_info).toBe('Your drawing will be automatically saved for one year. By using this service you agree to the terms of use.');
		expect(map.toolbox_measureTool_header).toBe('Measure');
		expect(map.toolbox_measureTool_measure).toBe('Measure');
		expect(map.toolbox_measureTool_stats_length).toBe('Length');
		expect(map.toolbox_measureTool_stats_area).toBe('Area');
		expect(map.toolbox_measureTool_start_new).toBe('Start New');
		expect(map.toolbox_measureTool_delete_point).toBe('Delete last point');
		expect(map.toolbox_measureTool_delete_measure).toBe('Delete measure');
		expect(map.toolbox_measureTool_measure_active).toBe('Tap in the map to start measurement.');
		expect(map.toolbox_measureTool_measure_draw).toBe('Tap in the map to continue drawing the line (double-tap to finish).');
		expect(map.toolbox_measureTool_measure_modify).toBe('Tap on the measurement, to add point;</br> Tap then drag to move the point;</br> Single tap on the point to delete.');
		expect(map.toolbox_measureTool_measure_select).toBe('Select existing or start new measurement');
		expect(map.toolbox_drawTool_finish).toBe('Finish');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 20;
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