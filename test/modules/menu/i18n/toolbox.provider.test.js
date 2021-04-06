import { provide } from '../../../../src/modules/menu/i18n/toolbox.provider';


describe('i18n for menu module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.menu_toolbox_draw_button).toBe('Zeichnen');
		expect(map.menu_toolbox_share_button).toBe('Teilen');

	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.menu_toolbox_draw_button).toBe('Draw');
		expect(map.menu_toolbox_share_button).toBe('Share');

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