import { $injector } from '../../../src/injection';
import {
	bvvDistanceUnitsProvider,
	bvvAreaUnitsProvider,
	distanceUnitsProvider,
	areaUnitsProvider,
	bvvAngleUnitsProvider
} from '../../../src/services/provider/units.provider';

describe('Units provider', () => {
	const configService = { getValue: () => {} };

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService);
	});

	it('provides formatted distance for metric system', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');

		expect(distanceUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm' });
		expect(distanceUnitsProvider(0, 2)).toEqual({ value: 0, localizedValue: '0', unit: 'm' });
		expect(distanceUnitsProvider(42, 0)).toEqual({ value: 42, localizedValue: '42', unit: 'm' });
		expect(distanceUnitsProvider(42, 2)).toEqual({ value: 42.0, localizedValue: '42.00', unit: 'm' });
		expect(distanceUnitsProvider(999, 0)).toEqual({ value: 999, localizedValue: '999', unit: 'm' });
		expect(distanceUnitsProvider(1000, 0)).toEqual({ value: 1, localizedValue: '1', unit: 'km' });
		expect(distanceUnitsProvider(1000, 2)).toEqual({ value: 1, localizedValue: '1.00', unit: 'km' });
		expect(distanceUnitsProvider(1234, 0)).toEqual({ value: 1.23, localizedValue: '1.23', unit: 'km' });
		expect(distanceUnitsProvider(1234, 2)).toEqual({ value: 1.23, localizedValue: '1.23', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1236, 0)).toEqual({ value: 1.24, localizedValue: '1.24', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1236, 2)).toEqual({ value: 1.24, localizedValue: '1.24', unit: 'km' });
		expect(distanceUnitsProvider(10000, 0)).toEqual({ value: 10, localizedValue: '10', unit: 'km' });
		expect(distanceUnitsProvider(10000, 2)).toEqual({ value: 10, localizedValue: '10.00', unit: 'km' });
	});

	it('provides formatted area for metric system', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');

		expect(areaUnitsProvider(42, 0)).toEqual({ value: 42, localizedValue: '42', unit: 'm²' });
		expect(areaUnitsProvider(999, 0)).toEqual({ value: 999, localizedValue: '999', unit: 'm²' });
		expect(areaUnitsProvider(1000000, 0)).toEqual({ value: 1, localizedValue: '1', unit: 'km²' });
		expect(areaUnitsProvider(1234567, 0)).toEqual({ value: 1.23, localizedValue: '1.23', unit: 'km²' });
		expect(areaUnitsProvider(1234567, 2)).toEqual({ value: 1.23, localizedValue: '1.23', unit: 'km²' });
		expect(areaUnitsProvider(100000, 0)).toEqual({ value: 100000, localizedValue: '100000', unit: 'm²' });
		expect(areaUnitsProvider(12345, 0)).toEqual({ value: 12345, localizedValue: '12345', unit: 'm²' });
		expect(areaUnitsProvider(12345, 2)).toEqual({ value: 12345, localizedValue: '12345.00', unit: 'm²' });
		expect(areaUnitsProvider(10000000, 0)).toEqual({ value: 10, localizedValue: '10', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567891234, 2)).toEqual({ value: 1234567.89, localizedValue: '1,234,567.890', unit: 'km²' });
	});

	it('provides formatted distance for bvv-metric system with default-locales (en)', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');

		expect(bvvDistanceUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(0, 2)).toEqual({ value: 0, localizedValue: '0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(42, 0)).toEqual({ value: 42, localizedValue: '42.0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(42, 2)).toEqual({ value: 42, localizedValue: '42.0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(999, 0)).toEqual({ value: 999, localizedValue: '999.0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(1000, 0)).toEqual({ value: 1, localizedValue: '1.00', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1000, 2)).toEqual({ value: 1, localizedValue: '1.00', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1234, 0)).toEqual({ value: 1.23, localizedValue: '1.23', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1234, 2)).toEqual({ value: 1.23, localizedValue: '1.23', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1236, 0)).toEqual({ value: 1.24, localizedValue: '1.24', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1236, 2)).toEqual({ value: 1.24, localizedValue: '1.24', unit: 'km' });
		expect(bvvDistanceUnitsProvider(10000, 0)).toEqual({ value: 10, localizedValue: '10.00', unit: 'km' });
		expect(bvvDistanceUnitsProvider(10000, 2)).toEqual({ value: 10, localizedValue: '10.00', unit: 'km' });
	});

	it('provides formatted area for bvv-metric system with default-locales (en)', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');

		expect(bvvAreaUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm²' });
		expect(bvvAreaUnitsProvider(0.3, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm²' });
		expect(bvvAreaUnitsProvider(0.6, 0)).toEqual({ value: 1, localizedValue: '1', unit: 'm²' });
		expect(bvvAreaUnitsProvider(42, 0)).toEqual({ value: 42, localizedValue: '42', unit: 'm²' });
		expect(bvvAreaUnitsProvider(999, 0)).toEqual({ value: 999, localizedValue: '999', unit: 'm²' });
		expect(bvvAreaUnitsProvider(1000000, 0)).toEqual({ value: 1, localizedValue: '1.000', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567, 0)).toEqual({ value: 1.23, localizedValue: '1.230', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567, 2)).toEqual({ value: 1.23, localizedValue: '1.230', unit: 'km²' });
		expect(bvvAreaUnitsProvider(100000, 0)).toEqual({ value: 100000, localizedValue: '100,000', unit: 'm²' });
		expect(bvvAreaUnitsProvider(12345, 0)).toEqual({ value: 12345, localizedValue: '12,345', unit: 'm²' });
		expect(bvvAreaUnitsProvider(12345, 2)).toEqual({ value: 12345, localizedValue: '12,345', unit: 'm²' });
		expect(bvvAreaUnitsProvider(10000000, 0)).toEqual({ value: 10, localizedValue: '10.000', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567891234, 2)).toEqual({ value: 1234567.89, localizedValue: '1,234,567.890', unit: 'km²' });
	});

	it('provides formatted angle for bvv-metric system with de-locales', () => {
		const configSpy = spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');

		expect(bvvAngleUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: '°' });
		expect(bvvAngleUnitsProvider(0, 2)).toEqual({ value: 0, localizedValue: '0', unit: '°' });
		expect(bvvAngleUnitsProvider(42.12345, 0)).toEqual({ value: 42.1, localizedValue: '42.1', unit: '°' });
		expect(bvvAngleUnitsProvider(42.12345, 2)).toEqual({ value: 42.1, localizedValue: '42.1', unit: '°' });

		expect(configSpy).toHaveBeenCalled();
	});

	it('provides formatted distance for bvv-metric system with de-locales', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');

		expect(bvvDistanceUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(0, 2)).toEqual({ value: 0, localizedValue: '0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(42, 0)).toEqual({ value: 42, localizedValue: '42,0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(42, 2)).toEqual({ value: 42, localizedValue: '42,0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(999, 0)).toEqual({ value: 999, localizedValue: '999,0', unit: 'm' });
		expect(bvvDistanceUnitsProvider(1000, 0)).toEqual({ value: 1, localizedValue: '1,00', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1000, 2)).toEqual({ value: 1, localizedValue: '1,00', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1234, 0)).toEqual({ value: 1.23, localizedValue: '1,23', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1234, 2)).toEqual({ value: 1.23, localizedValue: '1,23', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1236, 0)).toEqual({ value: 1.24, localizedValue: '1,24', unit: 'km' });
		expect(bvvDistanceUnitsProvider(1236, 2)).toEqual({ value: 1.24, localizedValue: '1,24', unit: 'km' });
		expect(bvvDistanceUnitsProvider(10000, 0)).toEqual({ value: 10, localizedValue: '10,00', unit: 'km' });
		expect(bvvDistanceUnitsProvider(10000, 2)).toEqual({ value: 10, localizedValue: '10,00', unit: 'km' });
	});

	it('provides formatted area for bvv-metric system with de-locales', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');

		expect(bvvAreaUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm²' });
		expect(bvvAreaUnitsProvider(0.3, 0)).toEqual({ value: 0, localizedValue: '0', unit: 'm²' });
		expect(bvvAreaUnitsProvider(0.6, 0)).toEqual({ value: 1, localizedValue: '1', unit: 'm²' });
		expect(bvvAreaUnitsProvider(42, 0)).toEqual({ value: 42, localizedValue: '42', unit: 'm²' });
		expect(bvvAreaUnitsProvider(999, 0)).toEqual({ value: 999, localizedValue: '999', unit: 'm²' });
		expect(bvvAreaUnitsProvider(1000000, 0)).toEqual({ value: 1, localizedValue: '1,000', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567, 0)).toEqual({ value: 1.23, localizedValue: '1,230', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567, 2)).toEqual({ value: 1.23, localizedValue: '1,230', unit: 'km²' });
		expect(bvvAreaUnitsProvider(100000, 0)).toEqual({ value: 100000, localizedValue: '100.000', unit: 'm²' });
		expect(bvvAreaUnitsProvider(12345, 0)).toEqual({ value: 12345, localizedValue: '12.345', unit: 'm²' });
		expect(bvvAreaUnitsProvider(12345, 2)).toEqual({ value: 12345, localizedValue: '12.345', unit: 'm²' });
		expect(bvvAreaUnitsProvider(10000000, 0)).toEqual({ value: 10, localizedValue: '10,000', unit: 'km²' });
		expect(bvvAreaUnitsProvider(1234567891234, 2)).toEqual({ value: 1234567.89, localizedValue: '1.234.567,890', unit: 'km²' });
	});

	it('provides formatted angle for bvv-metric system with de-locales', () => {
		const configSpy = spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');

		expect(bvvAngleUnitsProvider(0, 0)).toEqual({ value: 0, localizedValue: '0', unit: '°' });
		expect(bvvAngleUnitsProvider(0, 2)).toEqual({ value: 0, localizedValue: '0', unit: '°' });
		expect(bvvAngleUnitsProvider(42.123, 0)).toEqual({ value: 42.1, localizedValue: '42,1', unit: '°' });
		expect(bvvAngleUnitsProvider(42.123, 2)).toEqual({ value: 42.1, localizedValue: '42,1', unit: '°' });

		expect(configSpy).toHaveBeenCalled();
	});

	it('provides formatted distance for bvv-metric system with fallback-locales (en)', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('xx');

		expect(bvvDistanceUnitsProvider(10000, 2)).toEqual({ value: 10, localizedValue: '10.00', unit: 'km' });
	});

	it('provides formatted area for bvv-metric system with fallback-locales (en)', () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('xx');

		expect(bvvAreaUnitsProvider(1234567891234, 2)).toEqual({ value: 1234567.89, localizedValue: '1,234,567.890', unit: 'km²' });
	});
});
