import { coordinateSelectProvide } from '../../../../src/modules/footer/i18n/coordinateSelect.provider';

describe('i18n for coordinate select', () => {
	it('provides translation for en', () => {
		const map = coordinateSelectProvide('en');

		expect(map.footer_coordinate_select).toBe('Choose coordinate system');
	});

	it('provides translation for de', () => {
		const map = coordinateSelectProvide('de');

		expect(map.footer_coordinate_select).toBe('Koordinatensystem auswählen');
	});

	it('provides an empty map for a unknown lang', () => {
		const map = coordinateSelectProvide('unknown');

		expect(map).toEqual({});
	});
});
