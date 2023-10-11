/**
 * @module store/routing/routing_action
 */
import { $injector } from '../../injection/index';
import {
	ROUTING_ACTIVE_CHANGED,
	ROUTING_CATEGORY_CHANGED,
	ROUTING_ROUTE_CHANGED,
	ROUTING_STATS_CHANGED,
	ROUTING_STATUS_CHANGED,
	ROUTING_WAYPOINTS_CHANGED,
	ROUTING_START_SET,
	ROUTING_DESTINATION_SET
} from './routing.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Updates the current routing category
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
 * Updates the current routing status code.
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
 * Updates the current route stats.
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
 * Updates the current route.
 * @param {module:services/RoutingService~Route}  route the new Route
 * @function
 */
export const setRoute = (route) => {
	getStore().dispatch({
		type: ROUTING_ROUTE_CHANGED,
		payload: { ...route }
	});
};

/**
 * Updates the current waypoints updates the status to {@link RoutingStatusCodes.Ok}. A least two coordinates must be given, otherwise please use {@link setStart} and {@link setDestination}
 * @param {module:domain/coordinateTypeDef~Coordinate[]}  coordinates the new waypoint coordinates (in the map's SRID)
 * @function
 */
export const setWaypoints = (coordinates) => {
	if (coordinates.length > 1) {
		getStore().dispatch({
			type: ROUTING_WAYPOINTS_CHANGED,
			payload: [...coordinates]
		});
	}
};

/**
 * Sets a coordinate as the start waypoint and updates the status to {@link RoutingStatusCodes.Destination_Missing}
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate the start waypoint (in the SRID of the map)
 * @function
 */
export const setStart = (coordinate) => {
	getStore().dispatch({
		type: ROUTING_START_SET,
		payload: coordinate
	});
};

/**
 * Sets a coordinate as the destination waypoint and updates the status to {@link RoutingStatusCodes.Start_Destination_Missing}
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate the destination waypoint (in the SRID of the map)
 * @function
 */
export const setDestination = (coordinate) => {
	getStore().dispatch({
		type: ROUTING_DESTINATION_SET,
		payload: coordinate
	});
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
