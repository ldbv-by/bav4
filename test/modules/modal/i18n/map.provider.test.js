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

	it('provides an empty map for a unknown lang', () => {

		const modal = provide('unknown');

		expect(modal).toEqual({});
	});
});