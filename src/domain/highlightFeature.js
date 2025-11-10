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

/**
 * Id of the layer used for highlight visualization.
 */
export const HIGHLIGHT_LAYER_ID = 'highlight_layer';
/**
 * ID for a highlight feature when a query is running
 */
export const QUERY_RUNNING_HIGHLIGHT_FEATURE_ID = 'queryRunningHighlightFeatureId';
/**
 * Category for a highlight features after a query was successful
 */
export const QUERY_SUCCESS_HIGHLIGHT_FEATURE_CATEGORY = 'querySuccessHighlightFeatureCategory';
/**
 * Category for a highlight features containing a geometry after a query was successful
 */
export const QUERY_SUCCESS_WITH_GEOMETRY_HIGHLIGHT_FEATURE_CATEGORY = 'querySuccessWithGeometryHighlightFeatureCategory';
/**
 * Category for SearchResult related highlight features
 */
export const SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY = 'searchResultHighlightFeatureCategory';
/**
 * Category for SearchResult related temporary highlight features
 */
export const SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY = 'searchResultTemporaryHighlightFeatureCategory';
/**
 * ID for a highlight feature set by the crosshair query param
 */
export const CROSSHAIR_HIGHLIGHT_FEATURE_ID = 'crosshairHighlightFeatureId';
