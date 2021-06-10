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
				toolbox_drawTool_info: 'Your drawing will be automatically saved for one year. By using this service you agree to the terms of use.',
				toolbox_measureTool_header: 'Measure',
				toolbox_measureTool_measure: 'Measure',
				toolbox_measureTool_stats_length: 'Length',
				toolbox_measureTool_stats_area: 'Area',
				toolbox_measureTool_start_new: 'Start New',
				toolbox_shareTool_header: 'Share',
				toolbox_shareTool_embed: 'BayernAtlas-IFrame',
				toolbox_shareTool_preview: 'Preview',
				toolbox_shareTool_disclaimer: 'You can embed the map into your website or blog. Terms of use',
				toolbox_shareTool_mail: 'Mail',
				toolbox_shareTool_qr: 'QR-Code',
				toolbox_shareTool_title: 'BayernAtlas - official map viewer of the Bavarian Government',
				toolbox_shareTool_share: 'Share'
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
				toolbox_drawTool_info: 'Ihre Zeichnung wird automatisch für ein Jahr gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.',
				toolbox_measureTool_header: 'Messen',
				toolbox_measureTool_measure: 'Messen',
				toolbox_measureTool_stats_length: 'Länge',
				toolbox_measureTool_stats_area: 'Fläche',
				toolbox_measureTool_start_new: 'Neue Messung',
				toolbox_shareTool_header: 'Teilen',
				toolbox_shareTool_embed: 'BayernAtlas-IFrame',
				toolbox_shareTool_preview: 'Vorschau',
				toolbox_shareTool_disclaimer: 'Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den Nutzungsbedingungen zu.',
				toolbox_shareTool_mail: 'Mail',
				toolbox_shareTool_qr: 'QR-Code',
				toolbox_shareTool_title: 'BayernAtlas - der Kartenviewer des Freistaates Bayern',
				toolbox_shareTool_share: 'Teilen'
			};

		default:
			return {};
	}
};