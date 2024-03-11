import { BvvRoles } from '../../src/domain/roles';

describe('BvvRoles', () => {
	it('provides an enum of all known Bvv roles', () => {
		expect(Object.keys(BvvRoles).length).toBe(1);

		expect(BvvRoles.PLUS).toBe('Plus');
	});
});
