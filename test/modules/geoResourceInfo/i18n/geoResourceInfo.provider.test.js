import { provide } from '../../../../src/modules/geoResourceInfo/i18n/geoResourceInfo.provider';


describe('i18n for georesourceinfo', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.geoResourceInfo_empty_geoResourceInfo).toBe('No Layer Information available');
		expect(map.geoResourceInfo_geoResourceInfo_response_error).toBe('The Layer Information could not be loaded');
	});


	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.geoResourceInfo_empty_geoResourceInfo).toBe('Keine Ebenen-Information verfügbar');
		expect(map.geoResourceInfo_geoResourceInfo_response_error).toBe('Die Ebenen-Information konnte nicht geladen werden');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 2;
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
