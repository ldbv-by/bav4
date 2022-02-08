export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				dndImport_import_textcontent: 'Drop Text-Data or URL here',
				dndImport_import_filecontent: 'Drop KML/GPX/GeoJSON file here'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				dndImport_import_textcontent: 'Text oder URL hierhin ziehen',
				dndImport_import_filecontent: 'KML/GPX/GeoJSON Datei hierhin ziehen'
			};

		default:
			return {};
	}
};
