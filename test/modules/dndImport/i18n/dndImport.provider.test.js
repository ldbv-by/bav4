import { provide } from '../../../../src/modules/dndImport/i18n/dndImport.provider';


describe('i18n for dndImport module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.dndImport_import_textcontent).toBe('Text oder URL hierhin ziehen');
		expect(map.dndImport_import_filecontent).toBe('KML/GPX/GeoJSON Datei hierhin ziehen');
		expect(map.dndImport_import_unknown).toBe('Die Import-Daten sind unbekannt');
		expect(map.dndImport_import_unsupported).toBe('Der Dateityp wird nicht unterstützt');
		expect(map.dndImport_import_file_error).toBe('Die Datei kann nicht gelesen werden');
		expect(map.dndImport_import_no_file_found).toBe('Die Datei ist leer');
		expect(map.dndImport_import_max_size_exceeded).toBe('Die Datei überschreitet die erlaubte Größe');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.dndImport_import_textcontent).toBe('Drop Text-Data or URL here');
		expect(map.dndImport_import_filecontent).toBe('Drop KML/GPX/GeoJSON file here');
		expect(map.dndImport_import_unknown).toBe('Cannot read import-data');
		expect(map.dndImport_import_unsupported).toBe('The file-type is not supported');
		expect(map.dndImport_import_file_error).toBe('File is not readable');
		expect(map.dndImport_import_no_file_found).toBe('File not found');
		expect(map.dndImport_import_max_size_exceeded).toBe('Filesize is too large');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 7;
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
