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
	ROUTING_WAYPOINTS_CHANGED
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
 * @param {RouteStats}  routeStats the new RouteStats
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
 * @param {Route}  route the new Route
 * @function
 */
export const setRoute = (route) => {
	getStore().dispatch({
		type: ROUTING_ROUTE_CHANGED,
		payload: { ...route }
	});
};

/**
 * Updates the current waypoints.
 * @param {Coordinate[]}  coordinates the new waypoint coordinates
 * @function
 */
export const setWaypoints = (coordinates) => {
	getStore().dispatch({
		type: ROUTING_WAYPOINTS_CHANGED,
		payload: [...coordinates]
	});
};

/**
 * Activates the geolocation functionality.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ROUTING_ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the geolocation functionality.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ROUTING_ACTIVE_CHANGED,
		payload: false
	});
};
