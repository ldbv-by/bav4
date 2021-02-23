import { provide } from '../../../../src/modules/map/i18n/olMap.provider';


describe('i18n for map module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_olMap_zoom_in_button).toBe('Vergrößere Kartenausschnitt');
		expect(map.map_olMap_zoom_out_button).toBe('Verkleinere Kartenausschnitt');
		expect(map.map_olMap_info_button).toBe('Information');
		expect(map.map_olMap_info_button_help).toBe('Hilfe');
		expect(map.map_olMap_info_button_contact).toBe('Kontakt');
		expect(map.map_olMap_info_button_about).toBe('Impressum');
		expect(map.map_olMap_zoom_extent_button).toBe('Ganz Bayern anzeigen');
		expect(map.map_olMap_contextMenu_content_icon).toBe('In die Zwischenablage kopieren');
		expect(map.map_olMap_handler_measure_start).toBe('Klicken, um die Messung zu beginnen');
		expect(map.map_olMap_handler_measure_continue_line).toBe('Klicken, um die Messlinie zu zeichnen (Doppelklick zum Beenden)');
		expect(map.map_olMap_handler_measure_continue_polygon).toBe('Klicken, um die Fläche zu zeichnen (Doppelklick zum Beenden)');
		expect(map.map_olMap_handler_measure_snap_first_point).toBe('Klicke, um die Fläche zu schliessen');
		expect(map.map_olMap_handler_measure_snap_last_point).toBe('Klicke, um die Messung abzuschliessen');
		expect(map.map_olMap_handler_delete_last_point).toBe('Letzter Punkt löschen: ENTF Taste');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.map_olMap_zoom_in_button).toBe('Zoom in');
		expect(map.map_olMap_zoom_out_button).toBe('Zoom out');
		expect(map.map_olMap_info_button).toBe('Information');
		expect(map.map_olMap_info_button_help).toBe('Help');
		expect(map.map_olMap_info_button_contact).toBe('Contact');
		expect(map.map_olMap_info_button_about).toBe('About us');
		expect(map.map_olMap_contextMenu_content_icon).toBe('Copy to clipboard');		
		expect(map.map_olMap_handler_measure_start).toBe('Click to start measurement');
		expect(map.map_olMap_handler_measure_continue_line).toBe('Click to continue drawing the line (double-click to finish)');
		expect(map.map_olMap_handler_measure_continue_polygon).toBe('Click to continue drawing the polygon (double-click to finish)');
		expect(map.map_olMap_handler_measure_snap_first_point).toBe('Click to close the surface');
		expect(map.map_olMap_handler_measure_snap_last_point).toBe('Click to finish the line');
		expect(map.map_olMap_handler_delete_last_point).toBe('Press DEL to remove the last point drawn');
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});