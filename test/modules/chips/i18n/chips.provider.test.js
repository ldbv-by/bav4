import { provide } from '../../../../src/modules/chips/i18n/chips.provider';

describe('i18n for chips module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.chips_assist_chip_elevation_profile).toBe('Geländeprofil');
		expect(map.chips_assist_view_large_map).toBe('Große Karte anzeigen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.chips_assist_chip_elevation_profile).toBe('Elevation Profile');
		expect(map.chips_assist_view_large_map).toBe('View larger map');
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
