import { provide } from '../../../../src/modules/commons/i18n/valueSelect.provider';

describe('i18n for coordinate select', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.commons_valueSelect_icon_hint).toBe('Click to select value');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.commons_valueSelect_icon_hint).toBe('Klicken zum Auswählen');
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
