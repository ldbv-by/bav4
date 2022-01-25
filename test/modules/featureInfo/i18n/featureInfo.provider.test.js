import { provide } from '../../../../src/modules/featureInfo/i18n/featureInfo.provider';


describe('i18n for featureInfo module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.featureInfo_close_button).toBe('Schließen');
		expect(map.featureInfo_header).toBe('Objekt-Info');
		expect(map.geometryInfo_title_coordinate).toBe('Koordinate');
		expect(map.geometryInfo_title_azimuth).toBe('Azimuth-Winkel');
		expect(map.geometryInfo_title_line_length).toBe('Länge');
		expect(map.geometryInfo_title_polygon_length).toBe('Umfang');
		expect(map.geometryInfo_title_polygon_area).toBe('Fläche');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.featureInfo_close_button).toBe('Close');
		expect(map.featureInfo_header).toBe('Object Information');
		expect(map.geometryInfo_title_coordinate).toBe('Coordinate');
		expect(map.geometryInfo_title_azimuth).toBe('Azimuth-angle');
		expect(map.geometryInfo_title_line_length).toBe('Distance');
		expect(map.geometryInfo_title_polygon_length).toBe('Perimeter');
		expect(map.geometryInfo_title_polygon_area).toBe('Area');
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
