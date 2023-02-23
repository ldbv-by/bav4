import { provide } from '../../../../src/modules/map/i18n/attributionInfo.provider';

describe('i18n for attribution info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_attributionInfo_label).toBe('Data');
		expect(map.map_attributionInfo_collapse_title_open).toBe('Show all');
		expect(map.map_attributionInfo_collapse_title_close).toBe('Close');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_attributionInfo_label).toBe('Daten');
		expect(map.map_attributionInfo_collapse_title_open).toBe('Alle anzeigen');
		expect(map.map_attributionInfo_collapse_title_close).toBe('Schließen');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 3;
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
