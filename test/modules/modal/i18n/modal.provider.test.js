import { provide } from '../../../../src/modules/modal/i18n/modal.provider';

describe('i18n for modal module', () => {
	it('provides translation for de', () => {
		const modal = provide('de');

		expect(modal.modal_close_button).toBe('Schließen');
	});

	it('provides translation for en', () => {
		const modal = provide('en');

		expect(modal.modal_close_button).toBe('Close');
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
		const modal = provide('unknown');

		expect(modal).toEqual({});
	});
});
