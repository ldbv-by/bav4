import { $injector } from '../../src/injection';
import { UnitsService } from '../../src/services/UnitsService';

describe('UnitsService', () => {
	const configService = {
		getValue: () => 'en'
	};

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

	it('provides formatted distance for metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatDistance(42, 0)).toEqual(jasmine.objectContaining({ unit: 'm' }));
	});

	it('provides formatted area for bvv metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatArea(42, 0)).toEqual(jasmine.objectContaining({ unit: 'm²' }));
	});
});
