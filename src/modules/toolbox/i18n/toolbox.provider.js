export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				toolbox_drawTool_header: 'Draw',	
				toolbox_drawTool_symbol:'Symbol',
				toolbox_drawTool_text:'Text',
				toolbox_drawTool_line:'Line',
				toolbox_drawTool_polygon:'Polygon',
				toolbox_drawTool_delete:'Delete',
				toolbox_drawTool_share:'Share',
				toolbox_drawTool_save:'Save',
				toolbox_drawTool_info:'Your drawing will be automatically saved for one year. By using this service you agree to the terms of use.',
				toolbox_measureTool_header:'Measure',
				toolbox_measureTool_measure:'Measure',
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				toolbox_drawTool_header: 'Zeichnen',				
				toolbox_drawTool_symbol:'Symbol',
				toolbox_drawTool_text:'Text',
				toolbox_drawTool_line:'Linie',
				toolbox_drawTool_polygon:'Polygon',
				toolbox_drawTool_delete:'Löschen',
				toolbox_drawTool_share:'Teilen',
				toolbox_drawTool_save:'Speichern',
				toolbox_drawTool_info:'Ihre Zeichnung wird automatisch für ein Jahr gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.',
				toolbox_measureTool_header:'Messen',
				toolbox_measureTool_measure:'Messen',
			};

		default:
			return {};
	}
};