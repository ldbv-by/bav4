import { provide } from '../../../../src/modules/altitudeProfile/i18n/altitudeProfile.provider';

describe('i18n for altitudeProfile module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.altitudeProfile_header).toBe('this is a header');
		expect(map.altitudeProfile_distance).toBe('Entfernung');
		expect(map.altitudeProfile_incline).toBe('Steigung');
		expect(map.altitudeProfile_sumUp).toBe('SumUp de');
		expect(map.altitudeProfile_sumDown).toBe('SumDown de');
		expect(map.altitudeProfile_elevation).toBe('Höhe');
		expect(map.altitudeProfile_alt).toBe('Höhe');
		expect(map.altitudeProfile_slope).toBe('Steigung');
		expect(map.altitudeProfile_surface).toBe('anotherType');
		expect(map.altitudeProfile_anotherType).toBe('Untergrund');
		expect(map.altitudeProfile_unknown).toBe('unbekannt');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.altitudeProfile_header).toBe('this is a header');
		expect(map.altitudeProfile_distance).toBe('Distance');
		expect(map.altitudeProfile_incline).toBe('Incline');
		expect(map.altitudeProfile_sumUp).toBe('SumUp');
		expect(map.altitudeProfile_sumDown).toBe('SumDown');
		expect(map.altitudeProfile_elevation).toBe('Elevation');
		expect(map.altitudeProfile_alt).toBe('Elevation');
		expect(map.altitudeProfile_slope).toBe('Slope');
		expect(map.altitudeProfile_surface).toBe('surface');
		expect(map.altitudeProfile_anotherType).toBe('anotherType');
		expect(map.altitudeProfile_unknown).toBe('unknown');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 11;
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
