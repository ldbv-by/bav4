import { olMeasurementHandlerProvide } from '../../../../src/modules/map/i18n/olMeasurementHandler.provider';


describe('i18n for OlMeasurementHandler', () => {

	it('provides translation for de', () => {

		const map = olMeasurementHandlerProvide('de');

		expect(map.draw_measure_start).toBe('Klicken, um die Messung zu beginnen');
		expect(map.draw_measure_continue_line).toBe('Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)');
		expect(map.draw_measure_continue_polygon).toBe('Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)');
		expect(map.draw_measure_snap_first_point).toBe('Klicke, um die Fläche zu schliessen');
		expect(map.draw_measure_snap_last_point).toBe('Klicke, um die Messung abzuschliessen');
		expect(map.draw_delete_last_point).toBe('Letzter Punkt löschen: ENTF Taste');
	});

	it('provides translation for en', () => {

		const map = olMeasurementHandlerProvide('en');

		expect(map.draw_measure_start).toBe('Click to start measurement');
		expect(map.draw_measure_continue_line).toBe('Click to continue drawing the line (double-click to finish)');
		expect(map.draw_measure_continue_polygon).toBe('Click to continue drawing the polygon (double-click to finish)');
		expect(map.draw_measure_snap_first_point).toBe('Click to close the surface');
		expect(map.draw_measure_snap_last_point).toBe('Click to finish the line');
		expect(map.draw_delete_last_point).toBe('Press DEL to remove the last point drawn');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = olMeasurementHandlerProvide('unknown');

		expect(map).toEqual({});
	});
});