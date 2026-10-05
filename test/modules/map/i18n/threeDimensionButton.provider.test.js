import { provide } from '@src/modules/map/i18n/threeDimensionButton.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_threeDimensionButton_title_2d).toBe('Zur 3D-Ansicht wechseln');
		expect(map.map_threeDimensionButton_title_3d).toBe('Zur 2D-Ansicht wechseln');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_threeDimensionButton_title_2d).toBe('Switch to the 3D view');
		expect(map.map_threeDimensionButton_title_3d).toBe('Switch to the 2D view');
	});

	it('contains the expected amount of entries', () => {
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
