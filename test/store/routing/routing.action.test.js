import { CoordinateProposalType } from '../../../src/store/routing/routing.action';

describe('routingAction', () => {
	it('exports a enum for FeatureInfoGeometryTypes', () => {
		expect(Object.keys(CoordinateProposalType).length).toBe(6);
		expect(Object.isFrozen(CoordinateProposalType)).toBeTrue();
		expect(CoordinateProposalType.START_OR_DESTINATION).toBe(0);
		expect(CoordinateProposalType.START).toBe(1);
		expect(CoordinateProposalType.DESTINATION).toBe(2);
		expect(CoordinateProposalType.INTERMEDIATE).toBe(3);
		expect(CoordinateProposalType.EXISTING_START_OR_DESTINATION).toBe(4);
		expect(CoordinateProposalType.EXISTING_INTERMEDIATE).toBe(5);
	});
});
