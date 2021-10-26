/**
 * Action creators for highlighting a feature.
 * @module map/action
 */
import { CLEAR_FEATURES, FEATURE_CHANGED, SECONDARY_FEATURE_CHANGED } from './highlight.reducer';
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
	WKT: 0
});



const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets the {@link HighlightFeature}.
 * @param {HighlightFeature} feature
 * @function
 */
export const setHighlightFeature = (feature) => {
	getStore().dispatch({
		type: FEATURE_CHANGED,
		payload: feature
	});
};
/**
 * Removes the {@link HighlightFeature}
 * @function
 */
export const removeHighlightFeature = () => {
	getStore().dispatch({
		type: FEATURE_CHANGED,
		payload: null
	});
};

/**
 * Sets the secondary {@link HighlightFeature}.
 * @param {HighlightFeature} feature
 * @function
 */
export const setTemporaryHighlightFeature = (feature) => {
	getStore().dispatch({
		type: SECONDARY_FEATURE_CHANGED,
		payload: feature
	});
};

/**
 * Removes the secondary {@link HighlightFeature}.
 * @function
 */
export const removeTemporaryHighlightFeature = () => {
	getStore().dispatch({
		type: SECONDARY_FEATURE_CHANGED,
		payload: null
	});
};

/**
 * Removes both the permanent and the secondary {@link HighlightFeature}
 * @function
 */
export const clearHighlightFeatures = () => {
	getStore().dispatch({
		type: CLEAR_FEATURES
	});
};
