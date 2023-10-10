import { RoutingStatusCodes } from '../../src/domain/routing';

describe('RoutingStatusCodes', () => {
	it('provides an enum of all valid status codes', () => {
		expect(Object.keys(RoutingStatusCodes).length).toBe(6);

		expect(RoutingStatusCodes.Ok).toBe(200);
		expect(RoutingStatusCodes.Http_Backend_400).toBe(400);
		expect(RoutingStatusCodes.Http_Backend_500).toBe(500);
		expect(RoutingStatusCodes.Start_Destination_Missing).toBe(900);
		expect(RoutingStatusCodes.Destination_Missing).toBe(901);
		expect(RoutingStatusCodes.Start_Missing).toBe(902);
	});
});
