export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				dndImport_import_textcontent: 'Drop Text-Data or URL here',
				dndImport_import_filecontent: 'Drop KML/GPX/GeoJSON file here',
				dndImport_import_unknown: 'Cannot read import-data',
				dndImport_import_unsupported: 'The file-type is not supported',
				dndImport_import_file_error: 'File is not readable',
				dndImport_import_no_file_found: 'File not found',
				dndImport_import_max_size_exceeded: 'Filesize is too large'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				dndImport_import_textcontent: 'Text oder URL hierhin ziehen',
				dndImport_import_filecontent: 'KML/GPX/GeoJSON Datei hierhin ziehen',
				dndImport_import_unknown: 'Die Import-Daten sind unbekannt',
				dndImport_import_unsupported: 'Der Dateityp wird nicht unterstützt',
				dndImport_import_file_error: 'Die Datei kann nicht gelesen werden',
				dndImport_import_no_file_found: 'Die Datei ist leer',
				dndImport_import_max_size_exceeded: 'Die Datei überschreitet die erlaubte Größe'
			};

		default:
			return {};
	}
};
