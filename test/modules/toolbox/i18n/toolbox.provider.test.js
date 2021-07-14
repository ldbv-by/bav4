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
		expect(map.toolbox_measureTool_start_new).toBe('Neue Messung');
		expect(map.toolbox_shareTool_header).toBe('Teilen');
		expect(map.toolbox_shareTool_embed).toBe('BayernAtlas-IFrame');
		expect(map.toolbox_shareTool_preview).toBe('Vorschau');
		expect(map.toolbox_shareTool_disclaimer).toBe('Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den ');
		expect(map.toolbox_shareTool_termsOfUse).toBe('Nutzungsbedingungen zu.');
		expect(map.toolbox_shareTool_mail).toBe('Mail');
		expect(map.toolbox_shareTool_qr).toBe('QR-Code');
		expect(map.toolbox_shareTool_title).toBe('BayernAtlas - der Kartenviewer des Freistaates Bayern');
		expect(map.toolbox_shareTool_share).toBe('Teilen');
		expect(map.toolbox_shareTool_button_modal).toBe('Link generieren');
		expect(map.toolbox_shareTool_share_link_readonly).toBe('Link zum teilen des BayernAtlas');
		expect(map.toolbox_measureTool_delete_point).toBe('letzten Punkt löschen');
		expect(map.toolbox_measureTool_delete_measure).toBe('Messung löschen');
		expect(map.toolbox_measureTool_measure_active).toBe('In die Karte tippen, um die Messung zu beginnen');
		expect(map.toolbox_measureTool_measure_draw).toBe('In die Karte tippen, um die Messlinie zu zeichnen (Doppelt tippen zum Beenden)');
		expect(map.toolbox_measureTool_measure_modify).toBe('Tippe auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen');
		expect(map.toolbox_measureTool_measure_select).toBe('Eine bestehende Messung auswählen oder eine neue Messung beginnen');
		expect(map.toolbox_measureTool_share).toBe('Teilen');
		expect(map.toolbox_measureTool_share_api).toBe('Klicken, um zu teilen');
		expect(map.toolbox_measureTool_share_link_readonly).toBe('Link zum Teilen Ihrer Zeichnung');
		expect(map.toolbox_measureTool_share_link_edit).toBe('Link zum Editieren Ihrer Zeichnung');
		expect(map.toolbox_measureTool_share_link_title).toBe('geteilt über BayernAtlas.de');
		expect(map.toolbox_drawTool_finish).toBe('Fertig');
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
		expect(map.toolbox_measureTool_start_new).toBe('Start New');
		expect(map.toolbox_shareTool_header).toBe('Share');
		expect(map.toolbox_shareTool_embed).toBe('BayernAtlas-IFrame');
		expect(map.toolbox_shareTool_preview).toBe('Preview');
		expect(map.toolbox_shareTool_disclaimer).toBe('You can embed the map into your website or blog by accepting ');
		expect(map.toolbox_shareTool_termsOfUse).toBe('the Terms of use.');
		expect(map.toolbox_shareTool_mail).toBe('Mail');
		expect(map.toolbox_shareTool_qr).toBe('QR-Code');
		expect(map.toolbox_shareTool_title).toBe('BayernAtlas - official map viewer of the Bavarian Government');
		expect(map.toolbox_shareTool_share).toBe('Share');
		expect(map.toolbox_shareTool_button_modal).toBe('Generate URL');
		expect(map.toolbox_shareTool_share_link_readonly).toBe('Link to share BayernAtlas');
		expect(map.toolbox_measureTool_delete_point).toBe('Delete last point');
		expect(map.toolbox_measureTool_delete_measure).toBe('Delete measure');
		expect(map.toolbox_measureTool_measure_active).toBe('Tap on the map to start measurement');
		expect(map.toolbox_measureTool_measure_draw).toBe('Tap on the map to continue drawing the line (double-tap to finish)');
		expect(map.toolbox_measureTool_measure_modify).toBe('To add a point, tap on a measurement;</br> To move a point, press and drag it;</br> To delete a point, tap on it');
		expect(map.toolbox_measureTool_measure_select).toBe('Select an existing measurement or start a new one');
		expect(map.toolbox_measureTool_share).toBe('Share');
		expect(map.toolbox_measureTool_share_api).toBe('Click to share');
		expect(map.toolbox_measureTool_share_link_readonly).toBe('Link to share your measurement');
		expect(map.toolbox_measureTool_share_link_edit).toBe('Link to editable share your measurement');
		expect(map.toolbox_measureTool_share_link_title).toBe('shared with BayernAtlas.de');
		expect(map.toolbox_drawTool_finish).toBe('Finish');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 37;
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