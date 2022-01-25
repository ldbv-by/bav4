/**
 * Action creators to change/update the properties of featureInfo state.
 * @module featureInfo/action
 */
import { FEATURE_INFO_REQUEST_START, FEATURE_INFO_ADDED, FEATURE_INFO_REQUEST_ABORT, QUERY_REGISTERED, QUERY_RESOLVED } from './featureInfo.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * @typedef {Object} FeatureInfo
 * @property {string} title The Title of this FeatureInfo
 * @property {string|TemplateResult} content The content of this FeatureInfo
 * @property {FeatureInfoGeometry} [geometry] Corresponding geometry of this FeatureInfo
 */

/**
 * Geometry data for a {@link FeatureInfo}
 * @typedef {Object} FeatureInfoGeometry
 * @property {object|string} data Geometry (e.g. geoJson, WKT)
 * @property {FeatureInfoType} geometryType the type of the geometry

/**
 * Type of a {@link FeatureInfoGeometry}
 * @enum
 */
export const FeatureInfoGeometryTypes = Object.freeze({
	GEOJSON: 0
});


/**
  * Adds (appends) a single or an array of {@link FeatureInfo} items
  * @param {Array.<FeatureInfo>|FeatureInfo} featureInfo
  * @function
  */
export const addFeatureInfoItems = (featureInfo) => {

	const featureInfoAsArray = Array.isArray(featureInfo) ? [...featureInfo] : [featureInfo];

	getStore().dispatch({
		type: FEATURE_INFO_ADDED,
		payload: featureInfoAsArray
	});
};

/**
 * Starts a new FeatureInfo request.
 * @param {coordinate} coordinate
 * @function
 */
export const startRequest = (coordinate) => {

	getStore().dispatch({
		type: FEATURE_INFO_REQUEST_START,
		payload: new EventLike(coordinate)
	});
};

/**
 * Aborts the current FeatureInfo request and/or resets the result.
 * @param {coordinate} coordinate
 * @function
 */
export const abortOrReset = () => {

	getStore().dispatch({
		type: FEATURE_INFO_REQUEST_ABORT,
		payload: new EventLike()
	});
};

/**
 * Registers an active FeatureInfo query
 * @param {string} id id of that query
 * @function
 */
export const registerQuery = (id) => {

	getStore().dispatch({
		type: QUERY_REGISTERED,
		payload: id
	});
};

/**
 * Marks a FeatureInfo query as resolved.
 * @param {string} id
 * @function
 */
export const resolveQuery = (id) => {

	getStore().dispatch({
		type: QUERY_RESOLVED,
		payload: id
	});
};
