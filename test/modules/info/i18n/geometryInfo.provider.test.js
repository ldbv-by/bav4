import { provide } from '../../../../src/modules/info/i18n/geometryInfo.provider';

describe('i18n for geometry info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.info_geometryInfo_title_coordinate).toBe('Coordinate');
		expect(map.info_geometryInfo_title_azimuth).toBe('Azimuth');
		expect(map.info_geometryInfo_title_line_length).toBe('Distance');
		expect(map.info_geometryInfo_title_polygon_length).toBe('Perimeter');
		expect(map.info_geometryInfo_title_polygon_area).toBe('Area');
		expect(map.info_geometryInfo_copy_icon).toBe('Copy to clipboard');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.info_geometryInfo_title_coordinate).toBe('Koordinate');
		expect(map.info_geometryInfo_title_azimuth).toBe('Azimut');
		expect(map.info_geometryInfo_title_line_length).toBe('Länge');
		expect(map.info_geometryInfo_title_polygon_length).toBe('Umfang');
		expect(map.info_geometryInfo_title_polygon_area).toBe('Fläche');
		expect(map.info_geometryInfo_copy_icon).toBe('In die Zwischenablage kopieren');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 6;
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
