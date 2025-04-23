import { provide } from '../../../../src/modules/baseLayer/i18n/baseLayer.provider';

describe('i18n for header module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.baseLayer_switcher_header).toBe('Basiskarten');
		expect(map.baseLayer_container_category_raster).toBe('Raster');
		expect(map.baseLayer_container_category_vector).toBe('Vektor');
		expect(map.baseLayer_container_scroll_button_raster).toBe('zu den Rasterkarten');
		expect(map.baseLayer_container_scroll_button_vector).toBe('zu den Vektorkarten');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.baseLayer_switcher_header).toBe('Base maps');
		expect(map.baseLayer_container_category_raster).toBe('Raster');
		expect(map.baseLayer_container_category_vector).toBe('Vector');
		expect(map.baseLayer_container_scroll_button_raster).toBe('scroll to raster maps');
		expect(map.baseLayer_container_scroll_button_vector).toBe('scroll to vector maps');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 5;
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
