import { OafQueryableType } from '../../src/domain/oaf';

describe('OGC API Features', () => {
	it('provides an enum of all known OafQueryable types', () => {
		expect(Object.keys(OafQueryableType).length).toBe(6);
		expect(Object.isFrozen(OafQueryableType)).toBeTrue();

		expect(OafQueryableType.BOOLEAN).toBe('boolean');
		expect(OafQueryableType.INTEGER).toBe('integer');
		expect(OafQueryableType.FLOAT).toBe('float');
		expect(OafQueryableType.STRING).toBe('string');
		expect(OafQueryableType.DATE).toBe('date');
		expect(OafQueryableType.DATETIME).toBe('date-time');
	});
});
