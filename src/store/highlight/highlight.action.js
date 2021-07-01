/**
 * Action creators for highlighting a feature.
 * @module map/action
 */
import { CLEAR_FEATURES, FEATURE_CHANGED, SECONDARY_FEATURE_CHANGED } from './highlight.reducer';
import { $injector } from '../../injection';


/**
 * Contains information for highlighting a position or an area in a map.
 * @typedef {Object} HightlightFeature
 * @property {HightlightFeatureTypes} type  The type of this feature.
 * @property {HightlightCoordinate|HightlightGeometry} data The data which can be a coordinate or a geometry
 * @property {string} [label] Optional text 
 * 
 */

/**
 * Coordinate data for a {@link HightlightFeature}
 * @typedef {Object} HightlightCoordinate
 * @property {Coordinate} coordinate 
 */

/**
 * Geometry data for a {@link HightlightFeature}
 * @typedef {Object} HightlightGeometry
 * @property {object|string} geometry Geometry (e.g. geoJson, WKT) 
 * @property {HightlightFeatureGeometryTypes} geometryType the type of the geometry 
 */

export const HightlightFeatureTypes = Object.freeze({
	DEFAULT: 0
});

/**
 * Type of a {@link HightlightGeometry}
 * @enum
 */
export const HightlightGeometryTypes = Object.freeze({
	WKT: 0
});



const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets the {@link HightlightFeature}.
 * @param {HightlightFeature} feature
 * @function 
 */
export const setHighlightFeature = (feature) => {
	getStore().dispatch({
		type: FEATURE_CHANGED,
		payload: feature
	});
};
/**
 * Removes the {@link HightlightFeature}
 * @function
 */
export const removeHighlightFeature = () => {
	getStore().dispatch({
		type: FEATURE_CHANGED,
		payload: null
	});
};

/**
 * Sets the secondary {@link HightlightFeature}.
 * @param {HightlightFeature} feature 
 * @function
 */
export const setTemporaryHighlightFeature = (feature) => {
	getStore().dispatch({
		type: SECONDARY_FEATURE_CHANGED,
		payload: feature
	});
};

/**
 * Removes the secondary {@link HightlightFeature}.
 * @function
 */
export const removeTemporaryHighlightFeature = () => {
	getStore().dispatch({
		type: SECONDARY_FEATURE_CHANGED,
		payload: null
	});
};

/**
 * Removes both the permanent and the secondary {@link HightlightFeature} 
 * @function
 */
export const clearHighlightFeatures = () => {
	getStore().dispatch({
		type: CLEAR_FEATURES
	});
};
