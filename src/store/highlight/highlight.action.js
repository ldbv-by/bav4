/**
 * @module store/highlight/highlight_action
 */
import { CLEAR_FEATURES, FEATURE_ADD, REMOVE_FEATURE_BY_ID } from './highlight.reducer';
import { $injector } from '../../injection';

/**
 * Contains information for highlighting a position or an area in a map.
 * @typedef {Object} HighlightFeature
 * @property {HighlightFeatureType} type  The type of this feature.
 * @property {HighlightCoordinate|HighlightGeometry} data The data which can be a coordinate or a geometry
 * @property {string} [id] Optional id. If not present, the reducer will create one.
 * @property {string} [label] Optional text
 */

/**
 * Coordinate data for a {@link HighlightFeature}
 * @typedef {Object} HighlightCoordinate
 * @property {Coordinate} coordinate
 */

/**
 * Geometry data for a {@link HighlightFeature}
 * @typedef {Object} HighlightGeometry
 * @property {object|string} geometry Geometry (e.g. geoJson, WKT)
 * @property {HighlightGeometryType} geometryType the type of the geometry
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
 * Type of a {@link HighlightGeometry}
 * @readonly
 * @enum {Number}
 */
export const HighlightGeometryType = Object.freeze({
	GEOJSON: 0,
	WKT: 1
});

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Adds (appends) a single or an array of {@link HighlightFeature}.
 * @param {Array.<HighlightFeature>|HighlightFeature} features
 * @function
 */
export const addHighlightFeatures = (features) => {
	const featureAsArray = Array.isArray(features) ? [...features] : [features];
	getStore().dispatch({
		type: FEATURE_ADD,
		payload: featureAsArray
	});
};

/**
 * Removes all {@link HighlightFeature}s.
 * @function
 */
export const clearHighlightFeatures = () => {
	getStore().dispatch({
		type: CLEAR_FEATURES
	});
};

/**
 * Removes a (permanent or temporary) feature by its id.
 * If two or more feature have the same id, all of them are removed.
 * @param {Array.<String>|String} id HighlightFeature id
 * @function
 */
export const removeHighlightFeaturesById = (id) => {
	const idsAsArray = Array.isArray(id) ? [...id] : [id];
	getStore().dispatch({
		type: REMOVE_FEATURE_BY_ID,
		payload: idsAsArray
	});
};
