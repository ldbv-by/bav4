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
				toolbox_drawTool_style_desc: 'Description',
				toolbox_drawTool_style_symbol: 'Symbol',
				toolbox_drawTool_style_symbol_select: 'select Symbol',
				toolbox_drawTool_draw_active: 'Tap on the map to start drawing',
				toolbox_drawTool_draw_draw: 'Tap on the map to continue drawing the line (double-tap to finish)',
				toolbox_drawTool_draw_modify: 'To add a point, tap on a drawing;</br> To move a point, press and drag it;</br> To delete a point, tap on it',
				toolbox_drawTool_draw_select: 'Select an existing drawing or start a new one',
				toolbox_measureTool_header: 'Measure',
				toolbox_measureTool_measure: 'Measure',
				toolbox_measureTool_stats_length: 'Length',
				toolbox_measureTool_stats_area: 'Area',
				toolbox_measureTool_start_new: 'Start New',
				toolbox_shareTool_header: 'Share',
				toolbox_shareTool_embed: 'BayernAtlas-IFrame',
				toolbox_shareTool_preview: 'Preview',
				toolbox_shareTool_disclaimer: 'You can embed the map into your website or blog by accepting the terms of use.',
				toolbox_shareTool_mail: 'Mail',
				toolbox_shareTool_qr: 'QR-Code',
				toolbox_shareTool_title: 'BayernAtlas - official map viewer of the Bavarian Government',
				toolbox_shareTool_share: 'Share',
				toolbox_shareTool_button_modal: 'Generate URL',
				toolbox_shareTool_share_link_readonly: 'Link to share BayernAtlas',
				toolbox_shareTool_link: 'Link',
				toolbox_measureTool_delete_point: 'Delete last point',
				toolbox_measureTool_delete_measure: 'Delete measure',
				toolbox_measureTool_measure_active: 'Tap on the map to start measurement',
				toolbox_measureTool_measure_draw: 'Tap on the map to continue drawing the line (double-tap to finish)',
				toolbox_measureTool_measure_modify: 'To add a point, tap on a measurement;</br> To move a point, press and drag it;</br> To delete a point, tap on it',
				toolbox_measureTool_measure_select: 'Select an existing measurement or start a new one',
				toolbox_measureTool_share: 'Share',
				toolbox_measureTool_share_api: 'Click to share',
				toolbox_measureTool_share_link_title: 'shared with BayernAtlas.de',
				toolbox_import_data_header: 'Data Import',
				toolbox_import_data_subheader: 'KML, GPX, GeoJSON',
				toolbox_import_data_button: 'Choose a file',
				toolbox_import_data_seperator: 'or',
				toolbox_import_data_draganddrop: 'Drag and Drop',
				toolbox_import_data_draganddrop_target: 'into the Map',
				toolbox_import_data_sucess_notification: 'Data transferred succeeded',
				toolbox_import_url_header: 'URL Import',
				toolbox_import_url_subheader: 'WMS, KML, GPX, GeoJSON',
				toolbox_import_url_search_before: 'Please enter the Url into the ',
				toolbox_import_url_search: 'Search Bar',
				toolbox_import_url_search_after: 'the data will automatically transferred',
				toolbox_drawTool_finish: 'Finish',
				toolbox_prevent_switching_tool: 'Please close the current tool first',
				toolbox_toolbar_draw_button: 'Draw',
				toolbox_toolbar_share_button: 'Share',
				toolbox_toolbar_measure_button: 'Measure',
				toolbox_toolbar_import_button: 'Import',
				toolbox_clipboard_link_notification_text: 'The link',
				toolbox_measureTool_clipboard_measure_area_notification_text: 'The area',
				toolbox_measureTool_clipboard_measure_distance_notification_text: 'The distance',
				toolbox_clipboard_error: '"Copy to clipboard" is not available',
				toolbox_clipboard_success: 'was copied to clipboard',
				toolbox_copy_icon: 'Copy to clipboard',
				toolbox_measureTool_share_link: 'Anyone, who has this link, can edit this drawing',
				toolbox_toolbar_logo_badge: 'Beta',
				toolbox_importWms_input_url: 'URL',
				toolbox_importWms_input_user: 'Username',
				toolbox_importWms_input_pwd: 'Password',
				toolbox_importWms_textarea_layer: 'Layers',
				toolbox_importWms_textarea_description: 'Description',
				toolbox_importWms_button_connect: 'connect'
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
				toolbox_drawTool_delete_point: 'letzten Punkt löschen',
				toolbox_drawTool_delete_drawing: 'Zeichnung löschen',
				toolbox_drawTool_info: 'Ihre Zeichnung wird automatisch gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.',
				toolbox_drawTool_style_color: 'Farbe',
				toolbox_drawTool_style_size: 'Größe',
				toolbox_drawTool_style_size_small: 'Klein',
				toolbox_drawTool_style_size_medium: 'Mittel',
				toolbox_drawTool_style_size_large: 'Groß',
				toolbox_drawTool_style_feature: 'Eigenschaften',
				toolbox_drawTool_style_style: 'Stil',
				toolbox_drawTool_style_text: 'Text',
				toolbox_drawTool_style_desc: 'Beschreibung',
				toolbox_drawTool_style_symbol: 'Symbol',
				toolbox_drawTool_style_symbol_select: 'Symbol auswählen',
				toolbox_drawTool_draw_active: 'In die Karte tippen, um die Zeichnung zu beginnen',
				toolbox_drawTool_draw_draw: 'In die Karte tippen, um die Linie zu zeichnen (Doppelt tippen zum Beenden)',
				toolbox_drawTool_draw_modify: 'Tippe auf die Zeichnung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen',
				toolbox_drawTool_draw_select: 'Eine bestehende Zeichnung auswählen oder eine neue Zeichnung beginnen',
				toolbox_measureTool_header: 'Messen',
				toolbox_measureTool_measure: 'Messen',
				toolbox_measureTool_stats_length: 'Länge',
				toolbox_measureTool_stats_area: 'Fläche',
				toolbox_measureTool_start_new: 'Neue Messung',
				toolbox_shareTool_header: 'Teilen',
				toolbox_shareTool_embed: 'BayernAtlas-IFrame',
				toolbox_shareTool_preview: 'Vorschau',
				toolbox_shareTool_disclaimer: 'Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den <a href="https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html" target="_blank" tabindex="0"> Nutzungsbedingungen</a> zu.',
				toolbox_shareTool_mail: 'Mail',
				toolbox_shareTool_qr: 'QR-Code',
				toolbox_shareTool_title: 'BayernAtlas - der Kartenviewer des Freistaates Bayern',
				toolbox_shareTool_share: 'Teilen',
				toolbox_shareTool_button_modal: 'Link generieren',
				toolbox_shareTool_share_link_readonly: 'Link zum teilen des BayernAtlas',
				toolbox_shareTool_link: 'Link',
				toolbox_measureTool_delete_point: 'letzten Punkt löschen',
				toolbox_measureTool_delete_measure: 'Messung löschen',
				toolbox_measureTool_measure_active: 'In die Karte tippen, um die Messung zu beginnen',
				toolbox_measureTool_measure_draw: 'In die Karte tippen, um die Messlinie zu zeichnen (Doppelt tippen zum Beenden)',
				toolbox_measureTool_measure_modify: 'Tippe auf die Messung, um einen Punkt hinzuzufügen;</br> Punkt verschieben: tippen und ziehen;</br> Punkt löschen: auf Punkt tippen',
				toolbox_measureTool_measure_select: 'Eine bestehende Messung auswählen oder eine neue Messung beginnen',
				toolbox_measureTool_share: 'Teilen',
				toolbox_measureTool_share_api: 'Klicken, um zu teilen',
				toolbox_measureTool_share_link_title: 'geteilt über BayernAtlas.de',
				toolbox_import_data_header: 'Datei Import',
				toolbox_import_data_subheader: 'KML, GPX, GeoJSON',
				toolbox_import_data_button: 'Datei Auswählen',
				toolbox_import_data_seperator: 'oder',
				toolbox_import_data_draganddrop: 'Drag and Drop',
				toolbox_import_data_draganddrop_target: 'in die Karte',
				toolbox_import_data_sucess_notification: 'Daten konnten erfolgreich geladen werden',
				toolbox_import_url_header: 'URL Import',
				toolbox_import_url_subheader: 'WMS, KML, GPX, GeoJSON',
				toolbox_import_url_search_before: 'Bitte geben Sie die URL in das ',
				toolbox_import_url_search: 'Suchfeld',
				toolbox_import_url_search_after: 'ein. Die Daten werden automatisch geladen.',
				toolbox_drawTool_finish: 'Fertig',
				toolbox_prevent_switching_tool: 'Bitte zuerst das aktuelle Werkzeug schließen/beenden',
				toolbox_toolbar_draw_button: 'Zeichnen',
				toolbox_toolbar_share_button: 'Teilen',
				toolbox_toolbar_measure_button: 'Messen',
				toolbox_toolbar_import_button: 'Import',
				toolbox_clipboard_link_notification_text: 'Der Link',
				toolbox_measureTool_clipboard_measure_area_notification_text: 'Die Fläche',
				toolbox_measureTool_clipboard_measure_distance_notification_text: 'Die Länge',
				toolbox_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				toolbox_clipboard_success: 'wurde in die Zwischenablage kopiert',
				toolbox_copy_icon: 'In die Zwischenablage kopieren',
				toolbox_measureTool_share_link: 'Jeder, der diesen Link hat, kann an dieser Zeichnung mitarbeiten',
				toolbox_toolbar_logo_badge: 'Beta',
				toolbox_importWms_input_url: 'URL',
				toolbox_importWms_input_user: 'Nutzername',
				toolbox_importWms_input_pwd: 'Passwort',
				toolbox_importWms_textarea_layer: 'Ebenen',
				toolbox_importWms_textarea_description: 'Beschreibung',
				toolbox_importWms_button_connect: 'verbinden'
			};

		default:
			return {};
	}
};
