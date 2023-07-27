import { RoutingStatusCodes } from '../../../src/domain/routing';
import { setActive, setCategory, setRoute, setRouteStats, setStatus, setWaypoints } from '../../../src/store/routing/routing.action';
import { routingReducer } from '../../../src/store/routing/routing.reducer';
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
			active: false
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
	});

	it("changes the 'waypoint' property", () => {
		const store = setup();
		const coordinates = [
			[11, 22],
			[33, 44]
		];

		setWaypoints(coordinates);

		expect(store.getState().routing.waypoints).toEqual(coordinates);
	});

	it("changes the 'active' property", () => {
		const store = setup();

		setActive(true);

		expect(store.getState().routing.active).toBeTrue();

		setActive(false);

		expect(store.getState().routing.active).toBeFalse();
	});
});
