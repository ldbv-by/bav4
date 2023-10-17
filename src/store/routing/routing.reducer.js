import { RoutingStatusCodes } from '../../domain/routing';

export const ROUTING_CATEGORY_CHANGED = 'routing/categoryChanged';
export const ROUTING_STATUS_CHANGED = 'routing/statusChanged';
export const ROUTING_ROUTE_CHANGED = 'routing/routeChanged';
export const ROUTING_STATS_CHANGED = 'routing/statsChanged';
export const ROUTING_ACTIVE_CHANGED = 'routing/activeChanged';
export const ROUTING_WAYPOINTS_CHANGED = 'routing/waypointsChanged';
export const ROUTING_RESET = 'routing/reset';
export const ROUTING_START_SET = 'routing/startSet';
export const ROUTING_START_REMOVED = 'routing/startRemoved';
export const ROUTING_DESTINATION_SET = 'routing/destinationSet';
export const ROUTING_HIGHLIGHT_SEGMENTS_SET = 'routing/highlightSet';
export const ROUTING_HIGHLIGHT_SEGMENTS_REMOVED = 'routing/highlightRemoved';

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
	 * @property {Array<Array<number>>}
	 */
	highlightedSegments: [],
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
				route: payload ? { ...payload } : null
			};
		}
		case ROUTING_WAYPOINTS_CHANGED: {
			return {
				...state,
				waypoints: [...payload.map((c) => [...c])], // deep clone coordinates
				status: RoutingStatusCodes.Ok
			};
		}
		case ROUTING_RESET: {
			return {
				...state,
				waypoints: [],
				route: null,
				status: RoutingStatusCodes.Start_Destination_Missing
			};
		}
		case ROUTING_START_SET: {
			return {
				...state,
				waypoints: [[...payload]],
				status: RoutingStatusCodes.Destination_Missing
			};
		}
		case ROUTING_DESTINATION_SET: {
			return {
				...state,
				waypoints: [[...payload]],
				status: RoutingStatusCodes.Start_Missing
			};
		}
		case ROUTING_HIGHLIGHT_SEGMENTS_SET: {
			return {
				...state,
				highlightedSegments: [...payload.map((c) => [...c])] // deep clone segments
			};
		}
		case ROUTING_HIGHLIGHT_SEGMENTS_REMOVED: {
			return {
				...state,
				highlightedSegments: []
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
