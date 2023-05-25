import { provide } from '../../../../src/modules/baseLayer/i18n/baseLayer.provider';

describe('i18n for header module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.baseLayer_switcher_header).toBe('Basiskarten');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.baseLayer_switcher_header).toBe('Base maps');
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
