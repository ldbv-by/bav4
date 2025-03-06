import { html } from '../../../../node_modules/lit-html/lit-html';

export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				toolbox_drawTool_header: 'Draw',
				toolbox_drawTool_symbol: 'Symbol',
				toolbox_drawTool_text: 'Text',
				toolbox_drawTool_line: 'Line',
				toolbox_drawTool_polygon: 'Polygon',
				toolbox_drawTool_delete: 'Delete',
				toolbox_drawTool_share: 'Share',
				toolbox_drawTool_save: 'Save',
				toolbox_drawTool_cancel: 'Cancel',
				toolbox_drawTool_cancel_title: 'Cancel drawing',
				toolbox_drawTool_delete_point: 'Delete last point',
				toolbox_drawTool_delete_drawing: 'Delete drawing',
				toolbox_drawTool_info: 'Your drawing will be automatically saved. By using this service you agree to the terms of use.',
				toolbox_drawTool_style_color: 'Color',
				toolbox_drawTool_style_size: 'Size',
				toolbox_drawTool_style_size_small: 'Small',
				toolbox_drawTool_style_size_medium: 'Medium',
				toolbox_drawTool_style_size_large: 'Large',
				toolbox_drawTool_style_feature: 'Features',
				toolbox_drawTool_style_style: 'Style',
				toolbox_drawTool_style_text: 'Text',
				toolbox_drawTool_style_text_helper: 'Text in the map',
				toolbox_drawTool_style_desc: 'Description',
				toolbox_drawTool_style_symbol: 'Symbol',
				toolbox_drawTool_style_symbol_select: 'select Symbol',
				toolbox_drawTool_draw_init: 'Select a drawing type to start drawing',
				toolbox_drawTool_draw_active: 'Tap on the map to start drawing',
				toolbox_drawTool_draw_draw: 'Tap on the map to continue drawing the line (double-tap to finish)',
				toolbox_drawTool_draw_modify: 'To add a point, tap on a drawing;</br> To move a point, press and drag it;</br> To delete a point, tap on it',
				toolbox_drawTool_draw_select: 'Select an existing drawing or start a new one',
				toolbox_measureTool_header: 'Measure',
				toolbox_measureTool_measure: 'Measure',
				toolbox_measureTool_stats_length: 'Length',
				toolbox_measureTool_stats_area: 'Area',
				toolbox_measureTool_start_new: 'Start New',
				toolbox_measureTool_display_ruler: 'Display ruler',
				toolbox_shareTool_header: 'Share',
				toolbox_shareTool_embed: 'BayernAtlas-IFrame',
				toolbox_shareTool_preview: 'Preview',
				toolbox_shareTool_disclaimer: 'You can embed the map into your website or blog by accepting the terms of use.',
				toolbox_shareTool_mail: 'Mail',
				toolbox_shareTool_qr: 'QR-Code',
				toolbox_shareTool_share: 'Share',
				toolbox_shareTool_button_modal: 'Generate URL',
				toolbox_shareTool_share_link_readonly: 'Link to share BayernAtlas',
				toolbox_shareTool_share_api_failed: 'Sharing has failed',
				toolbox_shareTool_link: 'Link',
				toolbox_measureTool_delete_point: 'Delete last point',
				toolbox_measureTool_delete_measure: 'Delete measure',
				toolbox_measureTool_measure_active: 'Tap on the map to start measurement',
				toolbox_measureTool_measure_draw: 'Tap on the map to continue drawing the line (double-tap to finish)',
				toolbox_measureTool_measure_modify:
					'To add a point, tap on a measurement;</br> To move a point, press and drag it;</br> To delete a point, tap on it',
				toolbox_measureTool_measure_select: 'Select an existing measurement or start a new one',
				toolbox_measureTool_share: 'Share',
				toolbox_import_data_header: 'Data Import',
				toolbox_import_data_subheader: 'KML, GPX, GeoJSON, EWKT',
				toolbox_import_data_button: 'Choose a file',
				toolbox_import_data_seperator: 'or',
				toolbox_import_data_draganddrop: 'Drag and Drop',
				toolbox_import_data_draganddrop_target: 'into the Map',
				toolbox_import_data_sucess_notification: 'Data transferred succeeded',
				toolbox_import_url_header: 'URL Import',
				toolbox_import_url_subheader: 'WMS, KML, GPX, GeoJSON, EWKT',
				toolbox_import_url_search_before: 'Please enter the Url into the ',
				toolbox_import_url_search: 'Search Bar',
				toolbox_import_url_search_after: 'the data will automatically transferred',
				toolbox_import_unsupported: 'The file-type is not supported',
				toolbox_import_file_error: 'File is not readable',
				toolbox_import_no_file_found: 'File not found',
				toolbox_import_max_size_exceeded: 'Filesize is too large',
				toolbox_drawTool_finish: 'Finish',
				toolbox_drawTool_finish_title: 'Finish drawing',
				toolbox_prevent_switching_tool: 'Please close the current tool first',
				toolbox_toolbar_draw_button: 'Draw',
				toolbox_toolbar_share_button: 'Share',
				toolbox_toolbar_measure_button: 'Measure',
				toolbox_toolbar_import_button: 'Import',
				toolbox_toolbar_export_button: 'Export',
				toolbox_toolbar_logo_badge: '',
				toolbox_toolbar_logo_badge_standalone: 'Demo',
				toolbox_measureTool_clipboard_measure_area_notification_text: 'The area',
				toolbox_measureTool_clipboard_measure_distance_notification_text: 'The distance',
				toolbox_clipboard_error: '"Copy to clipboard" is not available',
				toolbox_clipboard_success: 'was copied to clipboard',
				toolbox_copy_icon: 'Copy to clipboard',
				toolbox_exportMfp_header: 'Export to PDF',
				toolbox_exportMfp_layout: 'Layout',
				toolbox_exportMfp_scale: 'Scale',
				toolbox_exportMfp_scale_decrease: 'Decrease scale',
				toolbox_exportMfp_scale_increase: 'Increase scale',
				toolbox_exportMfp_submit: 'Create PDF',
				toolbox_exportMfp_cancel: 'Cancel',
				toolbox_exportMfp_select_option: 'select...',
				toolbox_exportMfp_id_a4_landscape: 'A4 landscape',
				toolbox_exportMfp_id_a4_portrait: 'A4 portrait',
				toolbox_exportMfp_id_a3_landscape: 'A3 landscape',
				toolbox_exportMfp_id_a3_portrait: 'A3 portrait',
				toolbox_exportMfp_options: 'Export options',
				toolbox_exportMfp_show_grid_title: 'Add coordinate grid in export',
				toolbox_exportMfp_show_grid: 'Coordinate grid',
				toolbox_exportMfp_grid_supported: 'Not supported while map is rotated',
				toolbox_exportMfp_export_not_supported: 'Exporting the selected extent is not supported in this area.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				toolbox_drawTool_header: 'Zeichnen',
				toolbox_drawTool_symbol: 'Symbol',
				toolbox_drawTool_text: 'Text',
				toolbox_drawTool_line: 'Linie',
				toolbox_drawTool_polygon: 'Polygon',
				toolbox_drawTool_delete: 'Löschen',
				toolbox_drawTool_share: 'Teilen',
				toolbox_drawTool_save: 'Speichern',
				toolbox_drawTool_cancel: 'Abbrechen',
				toolbox_drawTool_cancel_title: 'Zeichnung abbrechen',
				toolbox_drawTool_delete_point: 'letzten Punkt löschen',
				toolbox_drawTool_delete_drawing: 'Zeichnung löschen',
				toolbox_drawTool_info:
					'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.',
				toolbox_drawTool_style_color: 'Farbe',
				toolbox_drawTool_style_size: 'Größe',
				toolbox_drawTool_style_size_small: 'Klein',
				toolbox_drawTool_style_size_medium: 'Mittel',
				toolbox_drawTool_style_size_large: 'Groß',
				toolbox_drawTool_style_feature: 'Eigenschaften',
				toolbox_drawTool_style_style: 'Stil',
				toolbox_drawTool_style_text: 'Text',
				toolbox_drawTool_style_text_helper: 'Text in der Karte',
				toolbox_drawTool_style_desc: 'Beschreibung',
				toolbox_drawTool_style_symbol: 'Symbol',
				toolbox_drawTool_style_symbol_select: 'Symbol auswählen',
				toolbox_drawTool_draw_init: 'Einen Zeichnungstyp auswählen, um die Zeichnung zu beginnen',
				toolbox_drawTool_draw_active: 'In die Karte tippen, um die Zeichnung zu beginnen',
				toolbox_drawTool_draw_draw: 'In die Karte tippen, um die Linie zu zeichnen (Doppelt tippen zum Beenden)',
				toolbox_drawTool_draw_modify:
					'Tippe auf die Zeichnung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen',
				toolbox_drawTool_draw_select: 'Eine bestehende Zeichnung auswählen oder eine neue Zeichnung beginnen',
				toolbox_measureTool_header: 'Messen',
				toolbox_measureTool_measure: 'Messen',
				toolbox_measureTool_stats_length: 'Länge',
				toolbox_measureTool_stats_area: 'Fläche',
				toolbox_measureTool_start_new: 'Neue Messung',
				toolbox_measureTool_display_ruler: 'Lineal anzeigen',
				toolbox_shareTool_header: 'Teilen',
				toolbox_shareTool_embed: 'BayernAtlas-IFrame',
				toolbox_shareTool_preview: 'Vorschau',
				toolbox_shareTool_disclaimer: (params) =>
					// prettier-ignore
					html`Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den <a href="${params[0]}" target="_blank" tabindex="0">Nutzungsbedingungen</a> zu.`,
				toolbox_shareTool_mail: 'Mail',
				toolbox_shareTool_qr: 'QR-Code',
				toolbox_shareTool_share: 'Teilen',
				toolbox_shareTool_button_modal: 'Link generieren',
				toolbox_shareTool_share_link_readonly: 'Link zum teilen des BayernAtlas',
				toolbox_shareTool_share_api_failed: 'Das Teilen ist fehlgeschlagen',
				toolbox_shareTool_link: 'Link',
				toolbox_measureTool_delete_point: 'letzten Punkt löschen',
				toolbox_measureTool_delete_measure: 'Messung löschen',
				toolbox_measureTool_measure_active: 'In die Karte tippen, um die Messung zu beginnen',
				toolbox_measureTool_measure_draw: 'In die Karte tippen, um die Messlinie zu zeichnen (Doppelt tippen zum Beenden)',
				toolbox_measureTool_measure_modify:
					'Tippe auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen',
				toolbox_measureTool_measure_select: 'Eine bestehende Messung auswählen oder eine neue Messung beginnen',
				toolbox_measureTool_share: 'Teilen',
				toolbox_import_data_header: 'Datei Import',
				toolbox_import_data_subheader: 'KML, GPX, GeoJSON, EWKT',
				toolbox_import_data_button: 'Datei Auswählen',
				toolbox_import_data_seperator: 'oder',
				toolbox_import_data_draganddrop: 'Drag and Drop',
				toolbox_import_data_draganddrop_target: 'in die Karte',
				toolbox_import_data_sucess_notification: 'Daten konnten erfolgreich geladen werden',
				toolbox_import_url_header: 'URL Import',
				toolbox_import_url_subheader: 'WMS, KML, GPX, GeoJSON, EWKT',
				toolbox_import_url_search_before: 'Bitte geben Sie die URL in das ',
				toolbox_import_url_search: 'Suchfeld',
				toolbox_import_url_search_after: 'ein. Die Daten werden automatisch geladen.',
				toolbox_import_unsupported: 'Der Dateityp wird nicht unterstützt',
				toolbox_import_file_error: 'Die Datei kann nicht gelesen werden',
				toolbox_import_no_file_found: 'Die Datei ist leer',
				toolbox_import_max_size_exceeded: 'Die Datei überschreitet die erlaubte Größe',
				toolbox_drawTool_finish: 'Fertig',
				toolbox_drawTool_finish_title: 'Zeichnung fertigstellen',
				toolbox_prevent_switching_tool: 'Bitte zuerst das aktuelle Werkzeug schließen/beenden',
				toolbox_toolbar_draw_button: 'Zeichnen',
				toolbox_toolbar_share_button: 'Teilen',
				toolbox_toolbar_measure_button: 'Messen',
				toolbox_toolbar_import_button: 'Import',
				toolbox_toolbar_export_button: 'Export',
				toolbox_toolbar_logo_badge: '',
				toolbox_toolbar_logo_badge_standalone: 'Demo',
				toolbox_measureTool_clipboard_measure_area_notification_text: 'Die Fläche',
				toolbox_measureTool_clipboard_measure_distance_notification_text: 'Die Länge',
				toolbox_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				toolbox_clipboard_success: 'wurde in die Zwischenablage kopiert',
				toolbox_copy_icon: 'In die Zwischenablage kopieren',
				toolbox_exportMfp_header: 'Export nach PDF',
				toolbox_exportMfp_layout: 'Seitenformat',
				toolbox_exportMfp_scale: 'Maßstab',
				toolbox_exportMfp_scale_decrease: 'Ausschnitt verkleinern',
				toolbox_exportMfp_scale_increase: 'Ausschnitt vergrößern',
				toolbox_exportMfp_submit: 'PDF erzeugen',
				toolbox_exportMfp_cancel: 'Abbrechen',
				toolbox_exportMfp_select_option: 'auswählen...',
				toolbox_exportMfp_id_a4_landscape: 'A4 Querformat',
				toolbox_exportMfp_id_a4_portrait: 'A4 Hochformat',
				toolbox_exportMfp_id_a3_landscape: 'A3 Querformat',
				toolbox_exportMfp_id_a3_portrait: 'A3 Hochformat',
				toolbox_exportMfp_options: 'Export-Optionen',
				toolbox_exportMfp_show_grid_title: 'Ein Koordinatennetz im Export hinzufügen',
				toolbox_exportMfp_show_grid: 'Koordinatennetz',
				toolbox_exportMfp_grid_supported: 'Nicht verfügbar, wenn Karte rotiert ist',
				toolbox_exportMfp_export_not_supported: 'Der Export des ausgewählten Ausschnitts ist in diesem Gebiet nicht möglich.'
			};

		default:
			return {};
	}
};
