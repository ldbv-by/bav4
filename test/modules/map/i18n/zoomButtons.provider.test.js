import { provide } from '../../../../src/modules/map/i18n/zoomButtons.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_zoomButtons_in).toBe('Vergrößere Kartenausschnitt');
		expect(map.map_zoomButtons_out).toBe('Verkleinere Kartenausschnitt');
		expect(map.map_zoomButtons_extent).toBe('Ganz Bayern anzeigen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_zoomButtons_in).toBe('Zoom in');
		expect(map.map_zoomButtons_out).toBe('Zoom out');
		expect(map.map_zoomButtons_extent).toBe('Zoom to full extent');
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
