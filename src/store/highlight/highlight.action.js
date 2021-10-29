/**
 * Action creators for highlighting a feature.
 * @module map/action
 */
import { CLEAR_FEATURES, FEATURE_ADD, FEATURE_SET, TEMPORARY_FEATURE_ADD, TEMPORARY_FEATURE_SET } from './highlight.reducer';
import { $injector } from '../../injection';


/**
 * Contains information for highlighting a position or an area in a map.
 * @typedef {Object} HighlightFeature
 * @property {HighlightFeatureTypes} type  The type of this feature.
 * @property {HighlightCoordinate|HighlightGeometry} data The data which can be a coordinate or a geometry
 * @property {string} [label] Optional text
 *
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
	DEFAULT: 0
});

/**
 * Type of a {@link HighlightGeometry}
 * @enum
 */
export const HighlightGeometryTypes = Object.freeze({
	WKT: 0,
	GEOJSON: 1
});



const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
* Sets a single or an array of {@link HighlightFeature}.
* @param {Array.<HighlightFeature>|HighlightFeature} features
* @function
*/
export const setHighlightFeatures = (feature) => {
	const featureAsArray = Array.isArray(feature) ? [...feature] : [feature];
	getStore().dispatch({
		type: FEATURE_SET,
		payload: featureAsArray
	});
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
export const removeHighlightFeatures = () => {
	getStore().dispatch({
		type: FEATURE_SET,
		payload: []
	});
};

/**
 * Sets a single or an array of secondary {@link HighlightFeature}.
 * @param {HighlightFeature} feature
 * @function
 */
export const setTemporaryHighlightFeatures = (feature) => {
	const featureAsArray = Array.isArray(feature) ? [...feature] : [feature];
	getStore().dispatch({
		type: TEMPORARY_FEATURE_SET,
		payload: featureAsArray
	});
};

/**
 * Adds (appends) a single or an array of secondary {@link HighlightFeature}.
 * @param {HighlightFeature} feature
 * @function
 */
export const addTemporaryHighlightFeatures = (feature) => {
	const featureAsArray = Array.isArray(feature) ? [...feature] : [feature];
	getStore().dispatch({
		type: TEMPORARY_FEATURE_ADD,
		payload: featureAsArray
	});
};

/**
 * Removes all secondary {@link HighlightFeature}s.
 * @function
 */
export const removeTemporaryHighlightFeatures = () => {
	getStore().dispatch({
		type: TEMPORARY_FEATURE_SET,
		payload: []
	});
};

/**
 * Removes both all permanent and secondary {@link HighlightFeature}s.
 * @function
 */
export const clearHighlightFeatures = () => {
	getStore().dispatch({
		type: CLEAR_FEATURES
	});
};
