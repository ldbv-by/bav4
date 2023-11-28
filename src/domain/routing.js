/**
 * @module domain/routing
 */

/**
 * @typedef  RouteGeometry
 * @property {String} data the data
 * @property {SourceType} sourceType the {@link SourceType} of the data
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
 * @property {number} [routeZindex] Optional zIndex of the displayed route
 * @property {string} [icon] Optional SVG path of the icon (at least the parent category should have one)
 * @property {string} [color] Optional color of this category (at least the parent category should have one)
 */

/**
 * Route result containing a multiple routes (one for each requested category/vehicle) (see also {@link module:domain/routing~GhRoute})
 * @typedef {Object.<string, module:domain/routing~GhRoute>} GhRoutingResult
 */

/**
 * GH-Route for a particular RoutingCategory id
 * @typedef  GhRoute
 * @property {string} vehicle the id, same as the id of a {@link module:domain/routing~RoutingCategory}
 * @property {object} hints
 * @property {string} hints.visited_nodes.average
 * @property {string} hints.visited_nodes.sum
 * @property {object} info
 * @property {string[]} info.copyrights
 * @property {number} info.took
 * @property {object[]} paths
 * @property {number} paths.distance
 * @property {number} paths.weight
 * @property {number} paths.time
 * @property {number} paths.transfers
 * @property {boolean} paths.points_encoded
 * @property {number[]} paths.bbox
 * @property {string} paths.points
 * @property {object} paths.legs
 * @property {object} paths.details
 * @property {array[]|number[]|string[]} paths.details.surface
 * @property {array[]|number[]|string[]} paths.details.road_class
 * @property {array[]|number[]|string[]} paths.details.track_type
 * @property {number} paths.ascend
 * @property {number} paths.descend
 * @property {string} paths.snapped_waypoints
 */

/**
 * @typedef {Object} RouteStats
 * @property {number} time The estimated time in seconds
 * @property {number} dist The distance in meters
 * @property {number[]} twoDiff the cumulated amount of up and down in meter
 * @property {module:domain/routing~RouteDetailTypes} details Contains detail information about different types
 * @property {module:domain/routing~RouteWarning} warnings Contains the warning hints
 */

/**
 * Contains detail information concerning the surface of the route.
 * @typedef {Object.<string, module:domain/routing~RouteWarningAttribute>} RouteWarning
 */

/**
 * Specific attribute of a route warning.
 * @typedef {Object} RouteWarningAttribute
 * @property {string} message The message
 * @property {RouteWarningCriticality} criticality The criticality of this hint
 * @property {Array<Array<number>>} segments Reference segments (from-to, both included)
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

/**
 * Contains a coordinate and its intention.
 * @typedef {Object} CoordinateProposal
 * @property {module:domain/coordinateTypeDef~Coordinate}  coord The coordinate (in the SRID of the map)
 * @property {CoordinateProposalType} type Intention of the coordinate
 */

/**
 * @readonly
 * @enum {Number}
 */
export const CoordinateProposalType = Object.freeze({
	START_OR_DESTINATION: 0,
	START: 1,
	DESTINATION: 2,
	INTERMEDIATE: 3,
	EXISTING_START_OR_DESTINATION: 4,
	EXISTING_INTERMEDIATE: 5
});

/**
 * @readonly
 * @enum {Number}
 */
export const RouteWarningCriticality = Object.freeze({
	HINT: 0,
	WARNING: 1
});
