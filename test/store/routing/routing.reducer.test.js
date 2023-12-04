import { CoordinateProposalType, RoutingStatusCodes } from '../../../src/domain/routing';
import {
	activate,
	deactivate,
	removeWaypoint,
	reset,
	resetHighlightedSegments,
	setCategory,
	setDestination,
	setHighlightedSegments,
	setIntermediate,
	setProposal,
	setRoute,
	setRouteStats,
	setStart,
	setStatus,
	setWaypoints
} from '../../../src/store/routing/routing.action';
import { routingReducer } from '../../../src/store/routing/routing.reducer';
import { EventLike } from '../../../src/utils/storeUtils.js';
import { TestUtils } from '../../test-utils.js';

describe('routingReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			routing: routingReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().routing).toEqual({
			categoryId: null,
			status: RoutingStatusCodes.Start_Destination_Missing,
			stats: null,
			route: null,
			waypoints: [],
			highlightedSegments: jasmine.objectContaining({ payload: null }),
			active: false,
			proposal: jasmine.objectContaining({ payload: null }),
			intermediate: jasmine.objectContaining({ payload: null })
		});
	});

	it("changes the 'setCategory' property", () => {
		const store = setup();

		setCategory('foo');

		expect(store.getState().routing.categoryId).toBe('foo');
	});

	it("changes the 'status' property", () => {
		const store = setup();

		setStatus(RoutingStatusCodes.Ok);

		expect(store.getState().routing.status).toBe(RoutingStatusCodes.Ok);
	});

	it("changes the 'routeStats' property", () => {
		const store = setup();
		const mockStats = { foo: 'bar' };

		setRouteStats(mockStats);

		expect(store.getState().routing.stats).toEqual(mockStats);
	});

	it("changes the 'route' property", () => {
		const store = setup();
		const mockRoute = { foo: 'bar' };

		setRoute(mockRoute);

		expect(store.getState().routing.route).toEqual(mockRoute);

		setRoute(null);

		expect(store.getState().routing.route).toBeNull();
	});

	it("changes the 'waypoint' property", () => {
		const store = setup();
		const coordinates = [
			[11, 22],
			[33, 44]
		];

		setWaypoints([[11, 22]]);

		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Destination_Missing);

		setWaypoints([
			[11, 22],
			[33, 44, 'foo']
		]);

		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Destination_Missing);

		setWaypoints({});

		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Destination_Missing);

		setWaypoints(coordinates);

		expect(store.getState().routing.waypoints).toEqual(coordinates);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Ok);
	});

	it('resets the "waypoint", "route" and "status" property', () => {
		const store = setup({
			routing: {
				waypoints: [
					[11, 22],
					[33, 44]
				],
				status: RoutingStatusCodes.Ok,
				route: {}
			}
		});

		expect(store.getState().routing.waypoints).toEqual([
			[11, 22],
			[33, 44]
		]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Ok);
		expect(store.getState().routing.route).not.toBeNull();

		reset();

		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Destination_Missing);
		expect(store.getState().routing.route).toBeNull();
	});

	it('sets the start waypoint', () => {
		const store = setup();
		const coordinate = [11, 22];

		setStart([11, 22, 'foo']);

		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Destination_Missing);

		setStart([11, 22]);

		expect(store.getState().routing.waypoints).toEqual([coordinate]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Destination_Missing);
	});

	it('sets the start waypoint when exactly one waypoint already exists', () => {
		const store = setup({
			routing: {
				waypoints: [[11, 22]]
			}
		});

		setStart([33, 44]);

		expect(store.getState().routing.waypoints).toEqual([
			[33, 44],
			[11, 22]
		]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Ok);
	});

	it('sets the destination waypoint', () => {
		const store = setup();
		const coordinate = [11, 22];

		setDestination([11, 22, 'foo']);

		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Destination_Missing);

		setDestination([11, 22]);

		expect(store.getState().routing.waypoints).toEqual([coordinate]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Start_Missing);
	});

	it('sets the destination waypoint when exactly one waypoint already exists', () => {
		const store = setup({
			routing: {
				waypoints: [[11, 22]]
			}
		});

		setDestination([33, 44]);

		expect(store.getState().routing.waypoints).toEqual([
			[11, 22],
			[33, 44]
		]);
		expect(store.getState().routing.status).toEqual(RoutingStatusCodes.Ok);
	});

	it('removes a waypoint', () => {
		const waypoints = [
			[11, 22],
			[33, 44]
		];
		const store = setup({
			routing: {
				waypoints,
				status: RoutingStatusCodes.Ok
			}
		});

		removeWaypoint([11, 22, 'foo']); //invalid coordinate
		expect(store.getState().routing.waypoints).toEqual(waypoints);

		removeWaypoint([5, 5]); //unknown coordinate
		expect(store.getState().routing.waypoints).toEqual(waypoints);

		removeWaypoint([11, 22]); // remove start waypoint
		expect(store.getState().routing.waypoints).toEqual([[33, 44]]);
		expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Missing);

		setWaypoints(waypoints);

		removeWaypoint([33, 44]); // remove destination waypoint
		expect(store.getState().routing.waypoints).toEqual([[11, 22]]);
		expect(store.getState().routing.status).toBe(RoutingStatusCodes.Destination_Missing);

		removeWaypoint([11, 22]); // remove the last waypoint
		expect(store.getState().routing.waypoints).toEqual([]);
		expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Destination_Missing);

		setWaypoints([...waypoints, [55, 66]]); // we have three three waypoinst now

		removeWaypoint([11, 22]);
		expect(store.getState().routing.waypoints).toEqual([
			[33, 44],
			[55, 66]
		]);
		expect(store.getState().routing.status).toBe(RoutingStatusCodes.Ok);
	});

	it('sets a proposal coordinate', () => {
		const store = setup();
		const coordinate = [11, 22];

		setProposal([11, 22, 'foo']);

		expect(store.getState().routing.proposal).toEqual(jasmine.objectContaining({ payload: null }));

		setProposal(coordinate);

		expect(store.getState().routing.proposal).toEqual(jasmine.objectContaining({ payload: null }));

		setProposal(coordinate, CoordinateProposalType.INTERMEDIATE);

		expect(store.getState().routing.proposal.payload.coord).toEqual(coordinate);
		expect(store.getState().routing.proposal.payload.type).toEqual(CoordinateProposalType.INTERMEDIATE);
	});

	it('sets a intermediate coordinate', () => {
		const store = setup({
			routing: {
				waypoints: [[11, 22]],
				intermediate: new EventLike()
			}
		});
		const coordinate = [33, 44];

		setIntermediate([11, 22]); // already exists, no update

		expect(store.getState().routing.intermediate.payload).toBeNull();

		setIntermediate([11, 22, 'foo']); // invalid coordinate, no update

		expect(store.getState().routing.intermediate.payload).toBeNull();

		setIntermediate(coordinate);

		expect(store.getState().routing.intermediate.payload).toEqual(coordinate);
	});

	it('sets a intermediate coordinate', () => {
		const store = setup();
		const coordinate = [11, 22];

		setIntermediate([11, 22, 'foo']);

		expect(store.getState().routing.intermediate).toEqual(jasmine.objectContaining({ payload: null }));

		setIntermediate([11, 22]);

		expect(store.getState().routing.intermediate.payload).toEqual(coordinate);
	});

	it("sets and removes the 'highlightedSegments' property", () => {
		const store = setup();
		const segments = [
			[1, 22],
			[30, 44]
		];

		setHighlightedSegments({
			segments
		});

		expect(store.getState().routing.highlightedSegments.payload).toEqual({ zoomToExtent: false, segments });

		setHighlightedSegments({
			segments,
			zoomToExtent: true
		});
		expect(store.getState().routing.highlightedSegments.payload).toEqual({ zoomToExtent: true, segments });

		resetHighlightedSegments();

		expect(store.getState().routing.highlightedSegments.payload).toBeNull();
	});

	it("changes the 'active' property", () => {
		const store = setup();

		activate();

		expect(store.getState().routing.active).toBeTrue();

		deactivate();

		expect(store.getState().routing.active).toBeFalse();
	});
});
