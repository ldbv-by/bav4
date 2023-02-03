import { provide } from '../../../../src/modules/elevationProfile/i18n/elevationProfile.provider';

describe('i18n for elevationProfile module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.elevationProfile_distance).toBe('Entfernung');
		expect(map.elevationProfile_slope).toBe('Steigung');
		expect(map.elevationProfile_sumUp).toBe('Aufstieg');
		expect(map.elevationProfile_sumDown).toBe('Abstieg');
		expect(map.elevationProfile_alt).toBe('Höhe');
		expect(map.elevationProfile_surface).toBe('Untergrund');
		expect(map.elevationProfile_elevation_reference_system).toBe('DGM 25 / DHHN2016');
		expect(map.elevationProfile_elevation_profile).toBe('Höhenprofil');
		expect(map.elevationProfile_verticalHeight).toBe('Höhe');
		expect(map.elevationProfile_highestPoint).toBe('Höchster Punkt');
		expect(map.elevationProfile_lowestPoint).toBe('Tiefster Punkt');
		expect(map.elevationProfile_linearDistance).toBe('Strecke');
		expect(map.elevationProfile_unknown).toBe('unbekannt');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.elevationProfile_distance).toBe('Distance');
		expect(map.elevationProfile_slope).toBe('Slope');
		expect(map.elevationProfile_sumUp).toBe('Ascent');
		expect(map.elevationProfile_sumDown).toBe('Descent');
		expect(map.elevationProfile_alt).toBe('Elevation');
		expect(map.elevationProfile_surface).toBe('Surface');
		expect(map.elevationProfile_elevation_reference_system).toBe('DGM 25 / DHHN2016');
		expect(map.elevationProfile_elevation_profile).toBe('Elevation Profile');
		expect(map.elevationProfile_verticalHeight).toBe('Vertical Height');
		expect(map.elevationProfile_highestPoint).toBe('Highest Point');
		expect(map.elevationProfile_lowestPoint).toBe('Lowest Point');
		expect(map.elevationProfile_linearDistance).toBe('Linear Distance');
		expect(map.elevationProfile_unknown).toBe('unknown');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 13;
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
