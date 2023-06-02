import { provide } from '../../../../src/modules/export/i18n/export.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.export_item_label_kml).toBe('KML');
		expect(map.export_item_description_kml).toBe('übernimmt Stil (Symbol, Farbe und Strichstärke) und alle Geometrietypen');
		expect(map.export_item_download_kml).toBe('.kml');
		expect(map.export_item_label_gpx).toBe('GPX');
		expect(map.export_item_description_gpx).toBe('übernimmt die Punkte und Linienzüge (Tracks). Polygone werden in Linienzüge umgewandelt');
		expect(map.export_item_download_gpx).toBe('.gpx');
		expect(map.export_item_label_geojson).toBe('GeoJSON');
		expect(map.export_item_description_geojson).toBe('übernimmt Stil (Symbol, Farbe und Strichstärke) und alle Geometrietypen');
		expect(map.export_item_download_geojson).toBe('.geojson');
		expect(map.export_item_label_ewkt).toBe('EWKT');
		expect(map.export_item_description_ewkt).toBe('übernimmt alle Geometrietypen, keine Stile');
		expect(map.export_item_download_ewkt).toBe('.txt');
		expect(map.export_item_srid_selection).toBe('SRID auswählen');
		expect(map.export_item_srid_selection_disabled).toBe('SRID ist vordefiniert');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.export_item_label_kml).toBe('KML');
		expect(map.export_item_description_kml).toBe('saves styles (symbols, color and width) and all geometry types');
		expect(map.export_item_download_kml).toBe('.kml');
		expect(map.export_item_label_gpx).toBe('GPX');
		expect(map.export_item_description_gpx).toBe('saves points and linestrings (tracks). Polygons are converted to linestrings');
		expect(map.export_item_download_gpx).toBe('.gpx');
		expect(map.export_item_label_geojson).toBe('GeoJSON');
		expect(map.export_item_description_geojson).toBe('saves styles (symbols, color and width) and all geometry types');
		expect(map.export_item_download_geojson).toBe('.geojson');
		expect(map.export_item_label_ewkt).toBe('EWKT');
		expect(map.export_item_description_ewkt).toBe('saves all geometry types, no styles');
		expect(map.export_item_download_ewkt).toBe('.txt');
		expect(map.export_item_srid_selection).toBe('Select SRID');
		expect(map.export_item_srid_selection_disabled).toBe('SRID is predefined');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 14;
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
