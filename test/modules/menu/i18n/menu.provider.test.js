import { provide } from '../../../../src/modules/menu/i18n/menu.provider';


describe('i18n for menu module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.menu_main_open_button).toBe('Menü öffnen');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.menu_main_open_button).toBe('Open menu');
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
