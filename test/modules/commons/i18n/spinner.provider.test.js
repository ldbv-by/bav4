import { provide } from '../../../../src/modules/commons/i18n/spinner.provider';

describe('i18n for coordinate select', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.commons_spinner_text).toBe('Loading');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.commons_spinner_text).toBe('Wird geladen');
	});

	it('contains the expected amount of entries', () => {
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
