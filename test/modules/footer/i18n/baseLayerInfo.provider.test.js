import { provide } from '../../../../src/modules/footer/i18n/baseLayerInfo.provider';

describe('i18n for baseLayer info', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_baseLayerInfo_label).toBe('Basemap');
		expect(map.map_baseLayerInfo_fallback).toBe('No information available');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_baseLayerInfo_label).toBe('Basiskarte');
		expect(map.map_baseLayerInfo_fallback).toBe('Keine Informationen verfügbar');
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
