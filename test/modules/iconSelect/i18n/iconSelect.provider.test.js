import { provide } from '../../../../src/modules/iconSelect/i18n/iconSelect.provider';


describe('i18n for iconSelect module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.iconSelect_icon_hint).toBe('Klicken, um es als Symbol auswählen');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.iconSelect_icon_hint).toBe('Click to select as icon');
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
