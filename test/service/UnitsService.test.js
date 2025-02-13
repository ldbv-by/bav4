import { $injector } from '../../src/injection';
import { UnitsService } from '../../src/services/UnitsService';

describe('UnitsService', () => {
	const configService = { getValue: () => 'en' };

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService);
	});

	it('provides default formatted distance', () => {
		const instanceUnderTest = new UnitsService();
		expect(instanceUnderTest.formatDistance(42.0)).toEqual({ value: '42.0', unit: 'm' });
	});

	it('provides default formatted area', () => {
		const instanceUnderTest = new UnitsService();
		expect(instanceUnderTest.formatArea(42)).toEqual({ value: '42', unit: 'm²' });
	});

	it('provides default formatted angle', () => {
		const instanceUnderTest = new UnitsService();
		expect(instanceUnderTest.formatAngle(42)).toEqual({ value: '42.0', unit: '°' });
	});

	it('provides formatted distance for metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatDistance(42, 0)).toEqual(jasmine.objectContaining({ unit: 'm' }));
	});

	it('provides formatted area for bvv metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatArea(42, 0)).toEqual(jasmine.objectContaining({ unit: 'm²' }));
	});

	it('provides formatted angle for bvv metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatAngle(42, 0)).toEqual(jasmine.objectContaining({ unit: '°' }));
	});

	it('replaces null or undefined values with 0 before calling UnitsProvider', () => {
		const distanceUnitsProviderMock = (value) => {
			return { value: value, unit: 'unit' };
		};

		const areaUnitsProviderMock = (value) => {
			return { value: value, unit: 'unit' };
		};

		const angleUnitsProviderMock = (value) => {
			return { value: value, unit: 'unit' };
		};

		const instanceUnderTest = new UnitsService(distanceUnitsProviderMock, areaUnitsProviderMock, angleUnitsProviderMock);

		expect(instanceUnderTest.formatDistance(null, 0)).toEqual(jasmine.objectContaining({ value: 0 }));
		expect(instanceUnderTest.formatArea(null, 0)).toEqual(jasmine.objectContaining({ value: 0 }));
		expect(instanceUnderTest.formatAngle(null, 0)).toEqual(jasmine.objectContaining({ value: 0 }));

		expect(instanceUnderTest.formatDistance(undefined, 0)).toEqual(jasmine.objectContaining({ value: 0 }));
		expect(instanceUnderTest.formatArea(undefined, 0)).toEqual(jasmine.objectContaining({ value: 0 }));
		expect(instanceUnderTest.formatAngle(undefined, 0)).toEqual(jasmine.objectContaining({ value: 0 }));
	});
});
