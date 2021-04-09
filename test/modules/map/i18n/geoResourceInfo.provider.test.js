import { provide } from '../../../../src/modules/map/i18n/geoResourceInfo.provider';


describe('i18n for georesource info', () => {

	it('provides translation for en', () => {

		const map = provide('en');
		
		expect(map.map_geoResourceInfo_label).toBe('Base Layer');		
	});


	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_geoResourceInfo_label).toBe('Hintergrundkarte');				
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 1;
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