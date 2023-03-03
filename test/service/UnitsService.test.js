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
		expect(instanceUnderTest.formatDistance(42.0)).toBe('42.0 m');
	});

	it('provides default formatted area', () => {
		const instanceUnderTest = new UnitsService();
		expect(instanceUnderTest.formatArea(42)).toBe('42 m²');
	});

	it('provides formatted distance for metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatDistance(42, 0)).toContain(' m');
	});

	it('provides formatted area for bvv metric system as default', () => {
		const instanceUnderTest = new UnitsService();

		expect(instanceUnderTest.formatArea(42, 0)).toContain('m²');
	});
});
