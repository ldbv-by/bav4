import { provide } from '../../../../src/modules/commons/i18n/spinner.provider';

describe('i18n for coordinate select', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.spinner_text).toBe('Loading');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.spinner_text).toBe('Wird geladen');
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
