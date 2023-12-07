import { RoutingStatusCodes } from '../../domain/routing';
import { EventLike, equals } from '../../utils/storeUtils';

export const ROUTING_CATEGORY_CHANGED = 'routing/categoryChanged';
export const ROUTING_STATUS_CHANGED = 'routing/statusChanged';
export const ROUTING_ROUTE_CHANGED = 'routing/routeChanged';
export const ROUTING_STATS_CHANGED = 'routing/statsChanged';
export const ROUTING_ACTIVE_CHANGED = 'routing/activeChanged';
export const ROUTING_WAYPOINTS_CHANGED = 'routing/waypointsChanged';
export const ROUTING_WAYPOINT_DELETED = 'routing/waypointDeleted';
export const ROUTING_RESET = 'routing/reset';
export const ROUTING_START_SET = 'routing/startSet';
export const ROUTING_DESTINATION_SET = 'routing/destinationSet';
export const ROUTING_PROPOSAL_SET = 'routing/proposalSet';
export const ROUTING_INTERMEDIATE_SET = 'routing/intermediateSet';
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
	 * @property {module:domain/routing~RouteGeometry}
	 */
	route: null,
	/**
	 * @property {module:domain/coordinateTypeDef~Coordinate[]}
	 */
	waypoints: [],
	/**
	 * @property {module:store/routing/routing_action~HighlightSegments}
	 */
	highlightedSegments: new EventLike(),
	/**
	 * @property {boolean}
	 */
	active: false,
	/**
	 *@property {EventLike<module:domain/routing~CoordinateProposal>}
	 */
	proposal: new EventLike(),
	/**
	 *@property {EventLike<domain/coordinateTypeDef~Coordinate>}
	 */
	intermediate: new EventLike()
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
		case ROUTING_WAYPOINT_DELETED: {
			const index = state.waypoints.findIndex((c) => equals(c, payload));
			const getNewStatus = () => {
				if (state.waypoints.length === 1 && index === 0) {
					return RoutingStatusCodes.Start_Destination_Missing;
				} else if (state.waypoints.length === 2) {
					switch (index) {
						case 0:
							return RoutingStatusCodes.Start_Missing;
						case 1:
							return RoutingStatusCodes.Destination_Missing;
					}
				}
				return state.status;
			};

			return {
				...state,
				waypoints: state.waypoints.filter((c) => !equals(c, payload)),
				status: getNewStatus()
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
			if (state.waypoints.length === 1) {
				return {
					...state,
					waypoints: [[...payload], ...state.waypoints],
					status: RoutingStatusCodes.Ok
				};
			}
			return {
				...state,
				waypoints: [[...payload]],
				status: RoutingStatusCodes.Destination_Missing
			};
		}
		case ROUTING_DESTINATION_SET: {
			if (state.waypoints.length === 1) {
				return {
					...state,
					waypoints: [...state.waypoints, [...payload]],
					status: RoutingStatusCodes.Ok
				};
			}
			return {
				...state,
				waypoints: [[...payload]],
				status: RoutingStatusCodes.Start_Missing
			};
		}
		case ROUTING_PROPOSAL_SET: {
			return {
				...state,
				proposal: payload
			};
		}
		case ROUTING_INTERMEDIATE_SET: {
			const index = state.waypoints.findIndex((c) => equals(c, payload.payload));
			if (index === -1) {
				return {
					...state,
					intermediate: payload
				};
			}
			return { ...state };
		}
		case ROUTING_HIGHLIGHT_SEGMENTS_SET: {
			return {
				...state,
				highlightedSegments: new EventLike({ ...payload, segments: [...payload.segments.map((c) => [...c])] /**deep clone segments */ })
			};
		}
		case ROUTING_HIGHLIGHT_SEGMENTS_REMOVED: {
			return {
				...state,
				highlightedSegments: new EventLike()
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
