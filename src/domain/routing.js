/**
 * @module domain/routing
 */
/**
 * @typedef  RoutingCategory
 * @property {string} id The id of this category
 * @property {string} label The label of this category
 * @property {string} description The description of this category
 * @property {string[]} subcategories Ids of possible subordinated categories
 * @property {module:domain/routing~RoutingCategoryStyle} style Style configuration for this category
 */

/**
 * Defines style properties for a {@link module:domain/routing~RoutingCategory}
 * @typedef {Object} RoutingCategoryStyle
 * @property {string} routeColor The fill color of the displayed route
 * @property {string} routeBorderColor The border color of the displayed route
 * @property {string} [icon] Optional SVG path of the icon (at least the parent category should have one)
 * @property {string} [color] Optional color of this category (at least the parent category should have one)
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
 * @property {module:domain/routing~RouteDetailTypes} details Contains detail information about different types
 * @property {object} warnings Contains warning hints
 */

/**
 *
 * @typedef {Object} RouteDetailTypes
 * @property {module:domain/routing~SurfaceDetails} surface Detail information concerning the surface of the route
 * @property {module:domain/routing~TrackDetails} road_class Detail information concerning the tracks of the route.
 */

/**
 * Contains detail information concerning the surface of the route.
 * @typedef {Object.<string, module:domain/routing~RouteDetailTypeAttribute>} SurfaceDetails
 */
/**
 * Contains detail information concerning the tracks of the route.
 * Route result containing a multiple routes (one for each requested category/vehicle) (see also {@link module:domain/routing~Route})
 * @typedef {Object.<string, module:domain/routing~RouteDetailTypeAttribute>} TrackDetails
 */

/**
 * Specific attribute of a route type.
 * @typedef {Object} RouteDetailTypeAttribute
 * @property {number} distance The cumulated distance for this category in meters
 * @property {Array<Array<number>>} segments Reference segments (from-to, both included)
 */

/**
 * Catalog object for a list of road- and surface-related {@link ChartItemStyleCatalog}
 * @typedef {Object} ChartItemStyleCatalogs
 * @property {module:domain/routing~ChartItemStyleCatalog} road The catalog for road styles
 * @property {module:domain/routing~ChartItemStyleCatalog} surface The catalog for road styles
 */

/**
 * Catalog object for a list of {@link module:domain/routing~ChartItemStyle} to a specific {@link module:domain/routing~RouteDetailTypeAttribute}
 * @typedef {Object.<string, module:domain/routing~ChartItemStyle>}  ChartItemStyleCatalog
 */

/**
 * Style object related to a specific {@link module:domain/routing~RouteDetailTypeAttribute}
 * @typedef {Object} ChartItemStyle
 * @property {number} id The id of this chart item
 * @property {string} label The label of this chart item
 * @property {string} [image] the stringified image, visualizing the chart item
 * @property {string} color the stringified color as rgba-value
 */

/**
 * Chart data object related to a specific {@link module:domain/routing~RouteDetailTypeAttribute}
 * @typedef {Object} ChartData
 * @property {number} absolute the absolute value
 * @property {string} relative the relative value
 * @property {Array<Array<number>>} segments the stringified image, visualizing the chart item
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
