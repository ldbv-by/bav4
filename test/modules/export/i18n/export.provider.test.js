import { provide } from '../../../../src/modules/export/i18n/export.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.export_item_label_kml).toBe('KML');
		expect(map.export_item_description_kml).toBe('verwendbar im BayernAtlas oder Google Earth und vielen GIS-Anwendungen');
		expect(map.export_item_download_kml).toBe('.kml');
		expect(map.export_item_label_gpx).toBe('GPX');
		expect(map.export_item_description_gpx).toBe('verwendbar in GPS-Geräten');
		expect(map.export_item_download_gpx).toBe('.gpx');
		expect(map.export_item_label_geojson).toBe('GeoJSON');
		expect(map.export_item_description_geojson).toBe('verwendbar im BayernAtlas und vielen GIS-Anwendungen');
		expect(map.export_item_download_geojson).toBe('.geojson');
		expect(map.export_item_label_ewkt).toBe('EWKT');
		expect(map.export_item_description_ewkt).toBe('verwendbar im BayernAtlas und vielen GIS-Anwendungen');
		expect(map.export_item_download_ewkt).toBe('.txt');
		expect(map.export_item_srid_selection).toBe('SRID auswählen');
		expect(map.export_item_srid_selection_disabled).toBe('SRID ist vordefiniert');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.export_item_label_kml).toBe('KML');
		expect(map.export_item_description_kml).toBe('usable in BayernAtlas or Google Earth and many GIS-Applications');
		expect(map.export_item_download_kml).toBe('.kml');
		expect(map.export_item_label_gpx).toBe('GPX');
		expect(map.export_item_description_gpx).toBe('usable on GPS-Devices');
		expect(map.export_item_download_gpx).toBe('.gpx');
		expect(map.export_item_label_geojson).toBe('GeoJSON');
		expect(map.export_item_description_geojson).toBe('usable in BayernAtlas and many GIS-Applications');
		expect(map.export_item_download_geojson).toBe('.geojson');
		expect(map.export_item_label_ewkt).toBe('EWKT');
		expect(map.export_item_description_ewkt).toBe('usable in BayernAtlas and many GIS-Applications');
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
