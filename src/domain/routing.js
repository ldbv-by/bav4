/**
 * @module domain/routing
 */
/**
 * @typedef {Object} RoutingCategory
 * @property {string} id The id of this category
 * @property {string} label The label of this category
 * @property {string[]} subcategories Ids of possible subordinated categories
 * @property {string} color Style: the fill color
 * @property {string} borderColor Style: the border color
 * @property {number} [zIndex] Style: the zIndex
 */

/**
 * @typedef {Object} RouteStats
 * @property {number} time The estimated time in seconds
 * @property {number} dist The distance in meters
 * @property {number[]} twoDiff the cumulated amount of up and down in meter
 * @property {RouteDetail} details Contains detail information
 * @property {object} warnings Contains warning hints
 */

/**
 * @typedef {Object} RouteDetail
 * @property {number} time The estimated time in seconds
 * @property {number} dist The distance in meters
 * @property {number[]} twoDiff the cumulated amount of up and down in meter
 * @property {object} details Contains Graphhopper specific detail about single segments (see Graphhopper docs)
 * @property {object} warnings Contains Graphhopper specific warning hints (see Graphhopper docs)
 */

/**
 * Routing related status code.
 * @readonly
 * @enum {number}
 */
export const RoutingStatusCodes = Object.freeze({
	Ok: 200,
	Http_Backend_400: 400,
	Http_Backend_500: 500,
	Start_Destination_Missing: 900
});
