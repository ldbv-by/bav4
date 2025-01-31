import { provide } from '../../../../src/modules/map/i18n/layerSwipeSlider.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_layerSwipeSlider).toBe('Nach links oder rechts verschieben');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_layerSwipeSlider).toBe('Move left or right');
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
