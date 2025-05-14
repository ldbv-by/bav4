import { BvvRoles } from '../../src/domain/roles';

describe('BvvRoles', () => {
	it('provides an enum of all known Bvv roles', () => {
		expect(Object.keys(BvvRoles).length).toBe(1);
		expect(Object.isFrozen(BvvRoles)).toBeTrue();

		expect(BvvRoles.PLUS).toBe('Plus');
	});
});
