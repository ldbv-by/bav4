import { provide } from '../../../../src/modules/uiTheme/i18n/uiTheme.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.uiTheme_toggle_tooltip_dark).toBe('Kontrastmodus deaktivieren');
		expect(map.uiTheme_toggle_tooltip_light).toBe('Kontrastmodus aktivieren');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.uiTheme_toggle_tooltip_dark).toBe('Disable contrast mode');
		expect(map.uiTheme_toggle_tooltip_light).toBe('Enable contrast mode');
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
