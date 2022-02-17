import { bvvDistanceUnitsProvider, bvvAreaUnitsProvider, distanceUnitsProvider, areaUnitsProvider } from '../../../src/services/provider/units.provider';


describe('Units provider', () => {

	it('provides formatted distance for metric system', () => {
		expect(distanceUnitsProvider(0, 0)).toBe('0 m');
		expect(distanceUnitsProvider(0, 2)).toBe('0 m');
		expect(distanceUnitsProvider(42, 0)).toBe('42 m');
		expect(distanceUnitsProvider(42, 2)).toBe('42.00 m');
		expect(distanceUnitsProvider(999, 0)).toBe('999 m');
		expect(distanceUnitsProvider(1000, 0)).toBe('1 km');
		expect(distanceUnitsProvider(1000, 2)).toBe('1.00 km');
		expect(distanceUnitsProvider(1234, 0)).toBe('1.23 km');
		expect(distanceUnitsProvider(1234, 2)).toBe('1.23 km');
		expect(distanceUnitsProvider(10000, 0)).toBe('10 km');
		expect(distanceUnitsProvider(10000, 2)).toBe('10.00 km');
	});

	it('provides formatted area for metric system', () => {
		expect(areaUnitsProvider(42, 0)).toBe('42 m&sup2;');
		expect(areaUnitsProvider(999, 0)).toBe('999 m&sup2;');
		expect(areaUnitsProvider(1000000, 0)).toBe('1 km&sup2;');
		expect(areaUnitsProvider(1234567, 0)).toBe('1.23 km&sup2;');
		expect(areaUnitsProvider(1234567, 2)).toBe('1.23 km&sup2;');
		expect(areaUnitsProvider(100000, 0)).toBe('100000 m&sup2;');
		expect(areaUnitsProvider(12345, 0)).toBe('12345 m&sup2;');
		expect(areaUnitsProvider(12345, 2)).toBe('12345.00 m&sup2;');
		expect(areaUnitsProvider(10000000, 0)).toBe('10 km&sup2;');
	});

	it('provides formatted distance for bvv-metric system', () => {

		expect(bvvDistanceUnitsProvider(0, 0)).toBe('0 m');
		expect(bvvDistanceUnitsProvider(0, 2)).toBe('0 m');
		expect(bvvDistanceUnitsProvider(42, 0)).toBe('42.0 m');
		expect(bvvDistanceUnitsProvider(42, 2)).toBe('42.0 m');
		expect(bvvDistanceUnitsProvider(999, 0)).toBe('999.0 m');
		expect(bvvDistanceUnitsProvider(1000, 0)).toBe('1.0 km');
		expect(bvvDistanceUnitsProvider(1000, 2)).toBe('1.0 km');
		expect(bvvDistanceUnitsProvider(1234, 0)).toBe('1.2 km');
		expect(bvvDistanceUnitsProvider(1234, 2)).toBe('1.2 km');
		expect(bvvDistanceUnitsProvider(10000, 0)).toBe('10.0 km');
		expect(bvvDistanceUnitsProvider(10000, 2)).toBe('10.0 km');
	});

	it('provides formatted area for bvv-metric system', () => {
		expect(bvvAreaUnitsProvider(0, 0)).toBe('0 m&sup2;');
		expect(bvvAreaUnitsProvider(0.3, 0)).toBe('0 m&sup2;');
		expect(bvvAreaUnitsProvider(0.6, 0)).toBe('1 m&sup2;');
		expect(bvvAreaUnitsProvider(42, 0)).toBe('42 m&sup2;');
		expect(bvvAreaUnitsProvider(999, 0)).toBe('999 m&sup2;');
		expect(bvvAreaUnitsProvider(1000000, 0)).toBe('1.000 km&sup2;');
		expect(bvvAreaUnitsProvider(1234567, 0)).toBe('1.230 km&sup2;');
		expect(bvvAreaUnitsProvider(1234567, 2)).toBe('1.230 km&sup2;');
		expect(bvvAreaUnitsProvider(100000, 0)).toBe('100000 m&sup2;');
		expect(bvvAreaUnitsProvider(12345, 0)).toBe('12345 m&sup2;');
		expect(bvvAreaUnitsProvider(12345, 2)).toBe('12345 m&sup2;');
		expect(bvvAreaUnitsProvider(10000000, 0)).toBe('10.000 km&sup2;');
	});
});
