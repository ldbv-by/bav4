import { provide } from '../../../../src/modules/map/i18n/threeDimensionButton.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_threeDimensionButton_title).toBe('lorem ipsum');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_threeDimensionButton_title).toBe('lorem ipsum');
	});

	it('contains the expected amount of entries', () => {
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
