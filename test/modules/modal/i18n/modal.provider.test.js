import { provide } from '../../../../src/modules/modal/i18n/modal.provider';

describe('i18n for modal module', () => {
	it('provides translation for de', () => {
		const modal = provide('de');

		expect(modal.modal_close_button).toBe('Schließen');
		expect(modal.modal_close_button_title).toBe('Fenster schließen');
	});

	it('provides translation for en', () => {
		const modal = provide('en');

		expect(modal.modal_close_button).toBe('Close');
		expect(modal.modal_close_button_title).toBe('Close modal');
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
		const modal = provide('unknown');

		expect(modal).toEqual({});
	});
});
