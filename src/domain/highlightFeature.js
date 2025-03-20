/**
 * @module domain/highlightFeature
 */
/**
 * Contains information for highlighting a position or an area in a map.
 * @typedef {Object} HighlightFeature
 * @property {HighlightFeatureType} type  The type of this feature.
 * @property {module:domain/coordinateTypeDef~Coordinate|Geometry} data The data which can be a coordinate or a geometry
 * @property {string} [id] Optional id. If not present, the reducer will create one.
 * @property {string} [label] Optional text
 * @property {string} [category] Optional category
 */

/**
 * @readonly
 * @enum {Number}
 */
export const HighlightFeatureType = Object.freeze({
	/**
	 * Marker (location pin)
	 */
	MARKER: 0,
	/**
	 * Marker (location pin) expressing a temporary meaning
	 */
	MARKER_TMP: 1,
	/**
	 * Indicates that a query is running (e.g. a feature info request)
	 */
	QUERY_RUNNING: 2,
	/**
	 * Indicates that a query was successful
	 */
	QUERY_SUCCESS: 3,
	/**
	 * Highlights a coordinate or a feature
	 */
	DEFAULT: 4,
	/**
	 * Highlights a coordinate or a feature expressing a temporary meaning
	 */
	DEFAULT_TMP: 5
});
