/**
 * @module store/routing/routing_action
 */
import { $injector } from '../../injection/index';
import { isCoordinate, isNumber } from '../../utils/checks';
import { EventLike } from '../../utils/storeUtils';
import {
	ROUTING_ACTIVE_CHANGED,
	ROUTING_CATEGORY_CHANGED,
	ROUTING_ROUTE_CHANGED,
	ROUTING_STATS_CHANGED,
	ROUTING_STATUS_CHANGED,
	ROUTING_RESET,
	ROUTING_START_SET,
	ROUTING_DESTINATION_SET,
	ROUTING_WAYPOINTS_CHANGED,
	ROUTING_HIGHLIGHT_SEGMENTS_SET,
	ROUTING_HIGHLIGHT_SEGMENTS_REMOVED,
	ROUTING_PROPOSAL_SET,
	ROUTING_WAYPOINT_DELETED,
	ROUTING_INTERMEDIATE_SET
} from './routing.reducer';

/**
 * Contains information for highlighting route segments.
 * @typedef {Object} HighlightSegments
 * @property {Array<Array<number>>} segments the segments
 * @property {boolean} [zoomToExtent] `true` if the map should be zoomed to the extent of the segments. Default is `false`.
 */

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Updates the `categoryId` property.
 * @param {String} categoryId the new category id
 * @function
 */
export const setCategory = (categoryId) => {
	getStore().dispatch({
		type: ROUTING_CATEGORY_CHANGED,
		payload: categoryId
	});
};

/**
 * Updates the `status` property.
 * @param {RoutingStatusCodes}  statusCode the new status code
 * @function
 */
export const setStatus = (statusCode) => {
	getStore().dispatch({
		type: ROUTING_STATUS_CHANGED,
		payload: statusCode
	});
};

/**
 * Updates the `stats` property.
 * @param {module:domain/routing~RouteStats}  routeStats the new RouteStats
 * @function
 */
export const setRouteStats = (routeStats) => {
	getStore().dispatch({
		type: ROUTING_STATS_CHANGED,
		payload: { ...routeStats }
	});
};

/**
 * Updates the `route` property.
 * @param {module:domain/routing~RouteGeometry|null}  route the new RouteGeometry or `null`
 * @function
 */
export const setRoute = (route) => {
	getStore().dispatch({
		type: ROUTING_ROUTE_CHANGED,
		payload: route ? { ...route } : null
	});
};

/**
 * Updates the current `waypoints`, updates the `status` to {@link RoutingStatusCodes.Ok}.  A least two coordinates must be given, otherwise please use {@link setStart} and {@link setDestination}.
 * @param {module:domain/coordinateTypeDef~Coordinate[]}  coordinates the new waypoint coordinates (in the map's SRID)
 * @function
 */
export const setWaypoints = (coordinates) => {
	if (coordinates?.length > 1 && !coordinates.some((c) => !isCoordinate(c))) {
		getStore().dispatch({
			type: ROUTING_WAYPOINTS_CHANGED,
			payload: [...coordinates]
		});
	}
};

/**
 * Removes a waypoint and updates the status when appropriate.
 * @param {module:domain/coordinateTypeDef~Coordinate[]}  coordinates the coordinate which should be removed from the waypoints (in the map's SRID)
 * @function
 */
export const removeWaypoint = (coordinates) => {
	if (isCoordinate(coordinates)) {
		getStore().dispatch({
			type: ROUTING_WAYPOINT_DELETED,
			payload: [...coordinates]
		});
	}
};

/**
 * Clears all `waypoints`, resets the `route` property and updates the `status` to {@link RoutingStatusCodes.Start_Destination_Missing}, but does not change the `active` property.
 *  @function
 */
export const reset = () => {
	getStore().dispatch({
		type: ROUTING_RESET,
		payload: {}
	});
};

/**
 * Sets a coordinate as the start waypoint and updates the status to {@link RoutingStatusCodes.Destination_Missing}.
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate the start waypoint (in the SRID of the map)
 * @function
 */
export const setStart = (coordinate) => {
	if (isCoordinate(coordinate)) {
		getStore().dispatch({
			type: ROUTING_START_SET,
			payload: coordinate
		});
	}
};

/**
 * Sets a coordinate as the destination waypoint and updates the status to {@link RoutingStatusCodes.Start_Missing}.
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate the destination waypoint (in the SRID of the map)
 * @function
 */
export const setDestination = (coordinate) => {
	if (isCoordinate(coordinate)) {
		getStore().dispatch({
			type: ROUTING_DESTINATION_SET,
			payload: coordinate
		});
	}
};

/**
 * Sets a coordinate as a proposal coordinate.
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate the proposal coordinate (in the SRID of the map)
 * @param {CoordinateProposalType} type the type of intention of the coordinate
 * @function
 */
export const setProposal = (coordinate, type) => {
	if (isCoordinate(coordinate) && isNumber(type)) {
		getStore().dispatch({
			type: ROUTING_PROPOSAL_SET,
			payload: new EventLike({ coord: [...coordinate], type })
		});
	}
};

/**
 * Suggests a coordinate as a new intermediate waypoint.
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate the coordinate (in the SRID of the map) which should be a new intermediate waypoint of the route
 * @function
 */
export const setIntermediate = (coordinate) => {
	if (isCoordinate(coordinate)) {
		getStore().dispatch({
			type: ROUTING_INTERMEDIATE_SET,
			payload: new EventLike([...coordinate])
		});
	}
};

/**
 * Activates the routing functionality.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ROUTING_ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the routing functionality.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ROUTING_ACTIVE_CHANGED,
		payload: false
	});
};

/**
 * Highlights the given segments of the current route geometry.
 * @param {module:store/routing/routing_action~HighlightSegments} highlightSegments
 * @function
 */
export const setHighlightedSegments = (highlightSegments) => {
	getStore().dispatch({
		type: ROUTING_HIGHLIGHT_SEGMENTS_SET,
		payload: { zoomToExtent: false, ...highlightSegments }
	});
};

/**
 * Removes the highlighted segments.
 * @function
 */
export const resetHighlightedSegments = () => {
	getStore().dispatch({
		type: ROUTING_HIGHLIGHT_SEGMENTS_REMOVED
	});
};
