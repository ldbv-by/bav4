import { coordinateSelectProvider } from '../../../../src/modules/footer/i18n/coordinateSelect.provider';

describe('i18n for coordinate select', () => {
	it('provides translation for en', () => {
		const map = coordinateSelectProvider('en');

		expect(map.footer_coordinate_select).toBe('Choose coordinate system');
	});

	it('provides translation for de', () => {
		const map = coordinateSelectProvider('de');

		expect(map.footer_coordinate_select).toBe('Koordinatensystem auswählen');
	});

	it('provides an empty map for a unknown lang', () => {
		const map = coordinateSelectProvider('unknown');

		expect(map).toEqual({});
	});
});
