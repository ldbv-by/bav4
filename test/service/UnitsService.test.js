import { UnitsService } from '../../src/services/UnitsService';
import { $injector } from '../../src/injection';


describe('UnitsService', () => {

	let instanceUnderTest;
	const configService = {
		getValue: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});

	beforeEach(() => {
		instanceUnderTest = new UnitsService();
	});

	it('provides default formatted distance', () => {
		spyOn(configService, 'getValue').and.returnValue(null);
		
		expect(instanceUnderTest.formatDistance(42)).toBe('42 m');		
	});

	it('provides default formatted area', () => {
		spyOn(configService, 'getValue').and.returnValue(null);
		
		expect(instanceUnderTest.formatArea(42)).toBe('42 m&sup2;');		
	});

	it('provides formatted distance', () => {
		const systemOfUnits = 'metric';
		
		spyOn(configService, 'getValue').and.returnValue(systemOfUnits);
		
		expect(instanceUnderTest.formatDistance(42)).toBe('42 m');
		expect(instanceUnderTest.formatDistance(999)).toBe('999 m');
		expect(instanceUnderTest.formatDistance(1000)).toBe('1 km');
		expect(instanceUnderTest.formatDistance(1234)).toBe('1.23 km');
		expect(instanceUnderTest.formatDistance(10000)).toBe('10 km');
	});

	it('provides formatted area', () => {
		const systemOfUnits = 'metric';
		
		spyOn(configService, 'getValue').and.returnValue(systemOfUnits);
		
		expect(instanceUnderTest.formatArea(42)).toBe('42 m&sup2;');
		expect(instanceUnderTest.formatArea(999)).toBe('999 m&sup2;');
		expect(instanceUnderTest.formatArea(1000000)).toBe('1 km&sup2;');
		expect(instanceUnderTest.formatArea(1234567)).toBe('1.23 km&sup2;');
		expect(instanceUnderTest.formatArea(10000)).toBe('1 ha');
		expect(instanceUnderTest.formatArea(12345)).toBe('1.23 ha');
		expect(instanceUnderTest.formatArea(10000000)).toBe('10 km&sup2;');
	});
});