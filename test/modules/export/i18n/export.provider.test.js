import { provide } from '../../../../src/modules/export/i18n/export.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.export_item_label_kml).toBe('KML');
		expect(map.export_item_description_kml).toBe('Übernimmt Attribute, Stil (Symbol, Farbe und Strichstärke) und alle Geometrietypen.');
		expect(map.export_item_download_kml).toBe('Download KML');
		expect(map.export_item_label_gpx).toBe('GPX');
		expect(map.export_item_description_gpx).toBe('Übernimmt Punkte und Linienzüge (Tracks). Polygone werden in Linienzüge umgewandelt.');
		expect(map.export_item_download_gpx).toBe('Download GPX');
		expect(map.export_item_label_geojson).toBe('GeoJSON');
		expect(map.export_item_description_geojson).toBe('Übernimmt Attribute und alle Geometrietypen, aber keine Stile.');
		expect(map.export_item_download_geojson).toBe('Download GeoJSON');
		expect(map.export_item_label_ewkt).toBe('EWKT');
		expect(map.export_item_description_ewkt).toBe('Übernimmt alle Geometrietypen, aber keine Stile.');
		expect(map.export_item_download_ewkt).toBe('Download TXT');
		expect(map.export_item_srid_selection).toBe('SRID auswählen');
		expect(map.export_item_srid_selection_disabled).toBe('SRID ist vordefiniert');
		expect(map.export_item_copy_to_clipboard(['foo'])).toBe('foo in die Zwischenablage kopieren');
		expect(map.export_item_clipboard_success).toBe('Die Daten wurden in die Zwischenablage kopiert');
		expect(map.export_item_clipboard_error).toBe('"In die Zwischenablage kopieren" steht nicht zur Verfügung');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.export_item_label_kml).toBe('KML');
		expect(map.export_item_description_kml).toBe('Saves attributes, styles (symbols, color and width) and all geometry types.');
		expect(map.export_item_download_kml).toBe('Download KML');
		expect(map.export_item_label_gpx).toBe('GPX');
		expect(map.export_item_description_gpx).toBe('Saves points and linestrings (tracks). Polygons are converted to linestrings.');
		expect(map.export_item_download_gpx).toBe('Download GPX');
		expect(map.export_item_label_geojson).toBe('GeoJSON');
		expect(map.export_item_description_geojson).toBe('Saves attributes and all geometry types, but no styles.');
		expect(map.export_item_download_geojson).toBe('Download GeoJSON');
		expect(map.export_item_label_ewkt).toBe('EWKT');
		expect(map.export_item_description_ewkt).toBe('Saves all geometry types, but no styles.');
		expect(map.export_item_download_ewkt).toBe('Download TXT');
		expect(map.export_item_srid_selection).toBe('Select SRID');
		expect(map.export_item_srid_selection_disabled).toBe('SRID is predefined');
		expect(map.export_item_copy_to_clipboard(['foo'])).toBe('Copy foo to clipboard');
		expect(map.export_item_clipboard_success).toBe('The data was copied to the clipboard');
		expect(map.export_item_clipboard_error).toBe('"Copy to clipboard" is not available');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 17;
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
