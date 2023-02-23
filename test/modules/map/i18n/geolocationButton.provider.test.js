import { provide } from '../../../../src/modules/map/i18n/geolocationButton.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_geolocationButton_title_activate).toBe('Ortung einschalten');
		expect(map.map_geolocationButton_title_deactivate).toBe('Ortung ausschalten');
		expect(map.map_geolocationButton_title_denied).toBe('Ortung nicht erlaubt oder nicht möglich');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_geolocationButton_title_activate).toBe('Activate geolocation');
		expect(map.map_geolocationButton_title_deactivate).toBe('Deactivate geolocation');
		expect(map.map_geolocationButton_title_denied).toBe('Geolocation not allowed or not possible');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 3;
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
