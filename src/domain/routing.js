/**
 * @module domain/routing
 */
/**
 * @typedef {Object} RoutingCategory
 * @property {string} id The id of this category
 * @property {string} label The label of this category
 * @property {string} description The description of this category
 * @property {string[]} subcategories Ids of possible subordinated categories
 * @property {string} color Style: the fill color
 * @property {string} borderColor Style: the border color
 */

/**
 * Route for a particular category (vehicle)
 * @typedef  Route
 * @property {object} categoryId
 * @property {string} categoryId.vehicle
 * @property {object} categoryId.hints
 * @property {string} categoryId.hints.visited_nodes.average
 * @property {string} categoryId.hints.visited_nodes.sum
 * @property {object} categoryId.info
 * @property {string[]} categoryId.info.copyrights
 * @property {number} categoryId.info.took
 * @property {object[]} categoryId.paths
 * @property {number} categoryId.paths.distance
 * @property {number} categoryId.paths.weight
 * @property {number} categoryId.paths.time
 * @property {number} categoryId.paths.transfers
 * @property {boolean} categoryId.paths.points_encoded
 * @property {number[]} categoryId.paths.bbox
 * @property {string} categoryId.paths.points
 * @property {object} categoryId.paths.legs
 * @property {object} categoryId.paths.details
 * @property {array[]|number[]|string[]} categoryId.paths.details.surface
 * @property {array[]|number[]|string[]} categoryId.paths.details.road_class
 * @property {array[]|number[]|string[]} categoryId.paths.details.track_type
 * @property {number} categoryId.paths.ascend
 * @property {number} categoryId.paths.descend
 * @property {string} categoryId.paths.snapped_waypoints
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
	Start_Destination_Missing: 900,
	Destination_Missing: 901,
	Start_Missing: 902
});
