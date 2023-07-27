import { RoutingStatusCodes } from '../../domain/routing';

export const ROUTING_CATEGORY_CHANGED = 'routing/categoryChanged';
export const ROUTING_STATUS_CHANGED = 'routing/statusChanged';
export const ROUTING_ROUTE_CHANGED = 'routing/routeChanged';
export const ROUTING_STATS_CHANGED = 'routing/statsChanged';
export const ROUTING_ACTIVE_CHANGED = 'routing/activeChanged';
export const ROUTING_WAYPOINTS_CHANGED = 'routing/waypointsChanged';

export const initialState = {
	/**
	 * @property {String}
	 */
	categoryId: null,
	/**
	 * @property {RoutingStatusCodes}
	 */
	status: RoutingStatusCodes.Start_Destination_Missing,
	/**
	 * @property {RouteStats}
	 */
	stats: null,
	/**
	 * @property {Route}
	 */
	route: null,
	/**
	 * @property {Coordinate[]}
	 */
	waypoints: [],
	/**
	 * @property {boolean}
	 */
	active: false
};

export const routingReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case ROUTING_CATEGORY_CHANGED: {
			return {
				...state,
				categoryId: payload
			};
		}
		case ROUTING_STATUS_CHANGED: {
			return {
				...state,
				status: payload
			};
		}
		case ROUTING_STATS_CHANGED: {
			return {
				...state,
				stats: { ...payload }
			};
		}
		case ROUTING_ROUTE_CHANGED: {
			return {
				...state,
				route: { ...payload }
			};
		}
		case ROUTING_WAYPOINTS_CHANGED: {
			return {
				...state,
				waypoints: [...payload],
				active: payload.length
			};
		}
		case ROUTING_ACTIVE_CHANGED: {
			return {
				...state,
				active: payload
			};
		}
	}

	return state;
};
