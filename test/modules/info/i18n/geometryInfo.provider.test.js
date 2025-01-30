import { provide } from '../../../../src/modules/info/i18n/geometryInfo.provider';

describe('i18n for geometry info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.geometryInfo_title_coordinate).toBe('Coordinate');
		expect(map.geometryInfo_title_azimuth).toBe('Azimuth-angle');
		expect(map.geometryInfo_title_line_length).toBe('Distance');
		expect(map.geometryInfo_title_polygon_length).toBe('Perimeter');
		expect(map.geometryInfo_title_polygon_area).toBe('Area');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.geometryInfo_title_coordinate).toBe('Koordinate');
		expect(map.geometryInfo_title_azimuth).toBe('Azimuth-Winkel');
		expect(map.geometryInfo_title_line_length).toBe('Länge');
		expect(map.geometryInfo_title_polygon_length).toBe('Umfang');
		expect(map.geometryInfo_title_polygon_area).toBe('Fläche');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 5;
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
