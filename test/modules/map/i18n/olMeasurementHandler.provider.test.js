import { olMeasurementHandlerProvide } from '../../../../src/modules/map/i18n/olMeasurementHandler.provider';


describe('i18n for OlMeasurementHandler', () => {

	it('provides translation for de', () => {

		const map = olMeasurementHandlerProvide('de');

		expect(map.draw_measure_start).toBe('Klicken, um die Messung zu beginnen');
		expect(map.draw_measure_continue_line).toBe('Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)');
		expect(map.draw_measure_continue_polygon).toBe('Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)');
	});

	it('provides translation for en', () => {

		const map = olMeasurementHandlerProvide('en');

		expect(map.draw_measure_start).toBe('Click to start measurement');
		expect(map.draw_measure_continue_line).toBe('Click to continue drawing the line (double-click to finish)');
		expect(map.draw_measure_continue_polygon).toBe('Click to continue drawing the polygon (double-click to finish)');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = olMeasurementHandlerProvide('unknown');

		expect(map).toEqual({});
	});
});