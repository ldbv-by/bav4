import { CoordinateProposalType, RouteCalculationErrors, RouteWarningCriticality, RoutingStatusCodes } from '../../src/domain/routing';

describe('RoutingStatusCodes', () => {
	it('provides an enum of all valid status codes', () => {
		expect(Object.keys(RoutingStatusCodes).length).toBe(4);

		expect(RoutingStatusCodes.Ok).toBe(200);
		expect(RoutingStatusCodes.Start_Destination_Missing).toBe(900);
		expect(RoutingStatusCodes.Destination_Missing).toBe(901);
		expect(RoutingStatusCodes.Start_Missing).toBe(902);
	});
});

describe('CoordinateProposalType', () => {
	it('provides an enum of all possible proposal types', () => {
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

describe('RouteWarningCriticality', () => {
	it('provides an enum all possible warning levels', () => {
		expect(Object.keys(RouteWarningCriticality).length).toBe(2);
		expect(Object.isFrozen(RouteWarningCriticality)).toBeTrue();
		expect(RouteWarningCriticality.HINT).toBe(0);
		expect(RouteWarningCriticality.WARNING).toBe(1);
	});
});

describe('RouteCalculationErrors', () => {
	it('provides an enum of possible errors when requesting a route', () => {
		expect(Object.keys(RouteCalculationErrors).length).toBe(2);

		expect(RouteCalculationErrors.Technical_Error).toBe(0);
		expect(RouteCalculationErrors.Improper_Waypoints).toBe(1);
	});
});
