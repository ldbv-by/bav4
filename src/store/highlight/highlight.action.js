/**
 * Action creators for highlighting a feature.
 * @module highlight/action
 */
import { CLEAR_FEATURES, FEATURE_ADD, REMOVE_FEATURE_BY_ID } from './highlight.reducer';
import { $injector } from '../../injection';


/**
 * Contains information for highlighting a position or an area in a map.
 * @typedef {Object} HighlightFeature
 * @property {HighlightFeatureTypes} type  The type of this feature.
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
 * @property {HighlightFeatureGeometryTypes} geometryType the type of the geometry
 */

export const HighlightFeatureTypes = Object.freeze({
	DEFAULT: 0,
	TEMPORARY: 1,
	ANIMATED: 2
});

/**
 * Type of a {@link HighlightGeometry}
 * @enum
 */
export const HighlightGeometryTypes = Object.freeze({
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
export const addHighlightFeatures = (feature) => {
	const featureAsArray = Array.isArray(feature) ? [...feature] : [feature];
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

