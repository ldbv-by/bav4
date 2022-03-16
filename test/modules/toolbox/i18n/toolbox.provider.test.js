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
		expect(map.toolbox_drawTool_cancel).toBe('Abbrechen');
		expect(map.toolbox_drawTool_delete_point).toBe('letzten Punkt löschen');
		expect(map.toolbox_drawTool_delete_drawing).toBe('Zeichnung löschen');
		expect(map.toolbox_drawTool_info).toBe('Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.');
		expect(map.toolbox_drawTool_style_color).toBe('Farbe');
		expect(map.toolbox_drawTool_style_size).toBe('Größe');
		expect(map.toolbox_drawTool_style_size_small).toBe('Klein');
		expect(map.toolbox_drawTool_style_size_medium).toBe('Mittel');
		expect(map.toolbox_drawTool_style_size_large).toBe('Groß');
		expect(map.toolbox_drawTool_style_text).toBe('Text');
		expect(map.toolbox_drawTool_style_desc).toBe('Beschreibung');
		expect(map.toolbox_drawTool_style_symbol).toBe('Symbol');
		expect(map.toolbox_drawTool_style_symbol_select).toBe('Symbol auswählen');
		expect(map.toolbox_drawTool_draw_active).toBe('In die Karte tippen, um die Zeichnung zu beginnen');
		expect(map.toolbox_drawTool_draw_draw).toBe('In die Karte tippen, um die Linie zu zeichnen (Doppelt tippen zum Beenden)');
		expect(map.toolbox_drawTool_draw_modify).toBe('Tippe auf die Zeichnung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen');
		expect(map.toolbox_drawTool_draw_select).toBe('Eine bestehende Zeichnung auswählen oder eine neue Zeichnung beginnen');
		expect(map.toolbox_measureTool_header).toBe('Messen');
		expect(map.toolbox_measureTool_measure).toBe('Messen');
		expect(map.toolbox_measureTool_stats_length).toBe('Länge');
		expect(map.toolbox_measureTool_stats_area).toBe('Fläche');
		expect(map.toolbox_measureTool_start_new).toBe('Neue Messung');
		expect(map.toolbox_shareTool_header).toBe('Teilen');
		expect(map.toolbox_shareTool_embed).toBe('BayernAtlas-IFrame');
		expect(map.toolbox_shareTool_preview).toBe('Vorschau');
		expect(map.toolbox_shareTool_disclaimer).toBe('Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den <a href="https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html" target="_blank" tabindex="0"> Nutzungsbedingungen</a> zu.');
		expect(map.toolbox_shareTool_mail).toBe('Mail');
		expect(map.toolbox_shareTool_qr).toBe('QR-Code');
		expect(map.toolbox_shareTool_title).toBe('BayernAtlas - der Kartenviewer des Freistaates Bayern');
		expect(map.toolbox_shareTool_share).toBe('Teilen');
		expect(map.toolbox_shareTool_button_modal).toBe('Link generieren');
		expect(map.toolbox_shareTool_share_link_readonly).toBe('Link zum teilen des BayernAtlas');
		expect(map.toolbox_shareTool_link).toBe('Link');
		expect(map.toolbox_measureTool_delete_point).toBe('letzten Punkt löschen');
		expect(map.toolbox_measureTool_delete_measure).toBe('Messung löschen');
		expect(map.toolbox_measureTool_measure_active).toBe('In die Karte tippen, um die Messung zu beginnen');
		expect(map.toolbox_measureTool_measure_draw).toBe('In die Karte tippen, um die Messlinie zu zeichnen (Doppelt tippen zum Beenden)');
		expect(map.toolbox_measureTool_measure_modify).toBe('Tippe auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen');
		expect(map.toolbox_measureTool_measure_select).toBe('Eine bestehende Messung auswählen oder eine neue Messung beginnen');
		expect(map.toolbox_measureTool_share).toBe('Teilen');
		expect(map.toolbox_measureTool_share_api).toBe('Klicken, um zu teilen');
		expect(map.toolbox_measureTool_share_link_title).toBe('geteilt über BayernAtlas.de');
		expect(map.toolbox_drawTool_finish).toBe('Fertig');
		expect(map.toolbox_prevent_switching_tool).toBe('Bitte zuerst das aktuelle Werkzeug schließen/beenden');
		expect(map.toolbox_toolbar_draw_button).toBe('Zeichnen');
		expect(map.toolbox_toolbar_share_button).toBe('Teilen');
		expect(map.toolbox_toolbar_measure_button).toBe('Messen');
		expect(map.toolbox_toolbar_logo_badge).toBe('Beta');
		expect(map.toolbox_clipboard_link_notification_text).toBe('Der Link');
		expect(map.toolbox_measureTool_clipboard_measure_area_notification_text).toBe('Die Fläche');
		expect(map.toolbox_measureTool_clipboard_measure_distance_notification_text).toBe('Die Länge');
		expect(map.toolbox_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
		expect(map.toolbox_clipboard_success).toBe('wurde in die Zwischenablage kopiert');
		expect(map.toolbox_copy_icon).toBe('In die Zwischenablage kopieren');
		expect(map.toolbox_measureTool_share_link).toBe('Jeder, der diesen Link hat, kann an dieser Zeichnung mitarbeiten');
		expect(map.toolbox_import_data_header).toBe('Datei Import');
		expect(map.toolbox_import_data_subheader).toBe('KML, GPX, GeoJSON');
		expect(map.toolbox_import_data_button).toBe('Datei Auswählen');
		expect(map.toolbox_import_data_seperator).toBe('oder');
		expect(map.toolbox_import_data_draganddrop).toBe('Drag and Drop');
		expect(map.toolbox_import_data_draganddrop_target).toBe('in die Karte');
		expect(map.toolbox_import_data_sucess_notification).toBe('Daten konnten erfolgreich geladen werden');
		expect(map.toolbox_import_url_header).toBe('URL Import');
		expect(map.toolbox_import_url_subheader).toBe('WMS, KML, GPX, GeoJSON');
		expect(map.toolbox_import_url_search_before).toBe('Bitte geben Sie die URL in das ');
		expect(map.toolbox_import_url_search).toBe('Suchfeld');
		expect(map.toolbox_import_url_search_after).toBe('ein. Die Daten werden automatisch geladen.');
		expect(map.toolbox_import_unsupported).toBe('Der Dateityp wird nicht unterstützt');
		expect(map.toolbox_import_file_error).toBe('Die Datei kann nicht gelesen werden');
		expect(map.toolbox_import_no_file_found).toBe('Die Datei ist leer');
		expect(map.toolbox_import_max_size_exceeded).toBe('Die Datei überschreitet die erlaubte Größe');
		expect(map.toolbox_toolbar_import_button).toBe('Import');
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
		expect(map.toolbox_drawTool_cancel).toBe('Cancel');
		expect(map.toolbox_drawTool_delete_point).toBe('Delete last point');
		expect(map.toolbox_drawTool_delete_drawing).toBe('Delete drawing');
		expect(map.toolbox_drawTool_info).toBe('Your drawing will be automatically saved. By using this service you agree to the terms of use.');
		expect(map.toolbox_drawTool_style_color).toBe('Color');
		expect(map.toolbox_drawTool_style_size).toBe('Size');
		expect(map.toolbox_drawTool_style_size_small).toBe('Small');
		expect(map.toolbox_drawTool_style_size_medium).toBe('Medium');
		expect(map.toolbox_drawTool_style_size_large).toBe('Large');
		expect(map.toolbox_drawTool_style_text).toBe('Text');
		expect(map.toolbox_drawTool_style_desc).toBe('Description');
		expect(map.toolbox_drawTool_style_symbol).toBe('Symbol');
		expect(map.toolbox_drawTool_style_symbol_select).toBe('select Symbol');
		expect(map.toolbox_drawTool_draw_active).toBe('Tap on the map to start drawing');
		expect(map.toolbox_drawTool_draw_draw).toBe('Tap on the map to continue drawing the line (double-tap to finish)');
		expect(map.toolbox_drawTool_draw_modify).toBe('To add a point, tap on a drawing;</br> To move a point, press and drag it;</br> To delete a point, tap on it');
		expect(map.toolbox_drawTool_draw_select).toBe('Select an existing drawing or start a new one');
		expect(map.toolbox_measureTool_header).toBe('Measure');
		expect(map.toolbox_measureTool_measure).toBe('Measure');
		expect(map.toolbox_measureTool_stats_length).toBe('Length');
		expect(map.toolbox_measureTool_stats_area).toBe('Area');
		expect(map.toolbox_measureTool_start_new).toBe('Start New');
		expect(map.toolbox_shareTool_header).toBe('Share');
		expect(map.toolbox_shareTool_embed).toBe('BayernAtlas-IFrame');
		expect(map.toolbox_shareTool_preview).toBe('Preview');
		expect(map.toolbox_shareTool_disclaimer).toBe('You can embed the map into your website or blog by accepting the terms of use.');
		expect(map.toolbox_shareTool_mail).toBe('Mail');
		expect(map.toolbox_shareTool_qr).toBe('QR-Code');
		expect(map.toolbox_shareTool_title).toBe('BayernAtlas - official map viewer of the Bavarian Government');
		expect(map.toolbox_shareTool_share).toBe('Share');
		expect(map.toolbox_shareTool_button_modal).toBe('Generate URL');
		expect(map.toolbox_shareTool_share_link_readonly).toBe('Link to share BayernAtlas');
		expect(map.toolbox_shareTool_link).toBe('Link');
		expect(map.toolbox_measureTool_delete_point).toBe('Delete last point');
		expect(map.toolbox_measureTool_delete_measure).toBe('Delete measure');
		expect(map.toolbox_measureTool_measure_active).toBe('Tap on the map to start measurement');
		expect(map.toolbox_measureTool_measure_draw).toBe('Tap on the map to continue drawing the line (double-tap to finish)');
		expect(map.toolbox_measureTool_measure_modify).toBe('To add a point, tap on a measurement;</br> To move a point, press and drag it;</br> To delete a point, tap on it');
		expect(map.toolbox_measureTool_measure_select).toBe('Select an existing measurement or start a new one');
		expect(map.toolbox_measureTool_share).toBe('Share');
		expect(map.toolbox_measureTool_share_api).toBe('Click to share');
		expect(map.toolbox_measureTool_share_link_title).toBe('shared with BayernAtlas.de');
		expect(map.toolbox_drawTool_finish).toBe('Finish');
		expect(map.toolbox_prevent_switching_tool).toBe('Please close the current tool first');
		expect(map.toolbox_toolbar_draw_button).toBe('Draw');
		expect(map.toolbox_toolbar_share_button).toBe('Share');
		expect(map.toolbox_toolbar_measure_button).toBe('Measure');
		expect(map.toolbox_toolbar_logo_badge).toBe('Beta');
		expect(map.toolbox_clipboard_link_notification_text).toBe('The link');
		expect(map.toolbox_measureTool_clipboard_measure_area_notification_text).toBe('The area');
		expect(map.toolbox_measureTool_clipboard_measure_distance_notification_text).toBe('The distance');
		expect(map.toolbox_clipboard_error).toBe('"Copy to clipboard" is not available');
		expect(map.toolbox_clipboard_success).toBe('was copied to clipboard');
		expect(map.toolbox_copy_icon).toBe('Copy to clipboard');
		expect(map.toolbox_measureTool_share_link).toBe('Anyone, who has this link, can edit this drawing');
		expect(map.toolbox_import_data_header).toBe('Data Import');
		expect(map.toolbox_import_data_subheader).toBe('KML, GPX, GeoJSON');
		expect(map.toolbox_import_data_button).toBe('Choose a file');
		expect(map.toolbox_import_data_seperator).toBe('or');
		expect(map.toolbox_import_data_draganddrop).toBe('Drag and Drop');
		expect(map.toolbox_import_data_draganddrop_target).toBe('into the Map');
		expect(map.toolbox_import_data_sucess_notification).toBe('Data transferred succeeded');
		expect(map.toolbox_import_url_header).toBe('URL Import');
		expect(map.toolbox_import_url_subheader).toBe('WMS, KML, GPX, GeoJSON');
		expect(map.toolbox_import_url_search_before).toBe('Please enter the Url into the ');
		expect(map.toolbox_import_url_search).toBe('Search Bar');
		expect(map.toolbox_import_url_search_after).toBe('the data will automatically transferred');
		expect(map.toolbox_import_unsupported).toBe('The file-type is not supported');
		expect(map.toolbox_import_file_error).toBe('File is not readable');
		expect(map.toolbox_import_no_file_found).toBe('File not found');
		expect(map.toolbox_import_max_size_exceeded).toBe('Filesize is too large');
		expect(map.toolbox_toolbar_import_button).toBe('Import');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 82;
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
