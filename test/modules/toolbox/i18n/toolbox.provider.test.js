import { provide } from '../../../../src/modules/toolbox/i18n/toolbox.provider';


describe('i18n for menu module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.toolbox_drawTool_header).toBe('Zeichnen');
		expect(map.toolbox_drawTool_symbol).toBe('Symbol');
		expect(map.toolbox_drawTool_text).toBe('Text');
		expect(map.toolbox_drawTool_line).toBe('Linie');
		expect(map.toolbox_drawTool_polygon).toBe('Polygon');
		expect(map.toolbox_drawTool_delete).toBe('Löschen');
		expect(map.toolbox_drawTool_share).toBe('Teilen');
		expect(map.toolbox_drawTool_save).toBe('Speichern');
		expect(map.toolbox_drawTool_info).toBe('Ihre Zeichnung wird automatisch für ein Jahr gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.');
		expect(map.toolbox_measureTool_header).toBe('Messen');
		expect(map.toolbox_measureTool_measure).toBe('Messen');
		expect(map.toolbox_measureTool_stats_length).toBe('Länge');
		expect(map.toolbox_measureTool_stats_area).toBe('Fläche');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.toolbox_drawTool_header).toBe('Draw');
		expect(map.toolbox_drawTool_symbol).toBe('Symbol');
		expect(map.toolbox_drawTool_text).toBe('Text');
		expect(map.toolbox_drawTool_line).toBe('Line');
		expect(map.toolbox_drawTool_polygon).toBe('Polygon');
		expect(map.toolbox_drawTool_delete).toBe('Delete');
		expect(map.toolbox_drawTool_share).toBe('Share');
		expect(map.toolbox_drawTool_save).toBe('Save');
		expect(map.toolbox_drawTool_info).toBe('Your drawing will be automatically saved for one year. By using this service you agree to the terms of use.');
		expect(map.toolbox_measureTool_header).toBe('Measure');
		expect(map.toolbox_measureTool_measure).toBe('Measure');
		expect(map.toolbox_measureTool_stats_length).toBe('Length');
		expect(map.toolbox_measureTool_stats_area).toBe('Area');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 13;
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