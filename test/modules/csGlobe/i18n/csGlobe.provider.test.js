import { provide } from '@src/modules/csGlobe/i18n/csGlobe.provider';

describe('i18n for csGlobe module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.csGlobe_map).toBe('Interaktive Karte');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.csGlobe_map).toBe('Interactive map');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 1;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for an unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
