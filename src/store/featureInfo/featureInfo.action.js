/**
 * Action creators to change/update the properties of featureInfo state.
 * @module featureInfo/action
 */
import { COORDINATE_UPDATED, FEATURE_INFO_ADDED, FEATURE_INFO_CLEARED, FEATURE_INFO_SET } from './featureInfo.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * FeatureInfo
 * @typedef {Object} FeatureInfo
 * @property {string} title The Title of this FeatureInfo
 * @property {string|TemplateResult} content The content of this FeatureInfo
 */


/**
  * Adds (appends) a single or an array of {@link FeatureInfo} items
  * @param {Array.<FeatureInfo>|FeatureInfo} featureInfo
  */
export const addFeatureInfoItems = (featureInfo) => {

	const featureInfoAsArray = Array.isArray(featureInfo) ? [...featureInfo] : [featureInfo];

	getStore().dispatch({
		type: FEATURE_INFO_ADDED,
		payload: featureInfoAsArray
	});
};

/**
  * Removes all  {@link FeatureInfo} items
  * @param {FeatureInfo} featureInfo
  */
export const clearFeatureInfoItems = () => {

	getStore().dispatch({
		type: FEATURE_INFO_CLEARED
	});
};

/**
 * Updates the coordinate.
 * @param {coordinate} coordinate
 */
export const updateCoordinate = (coordinate) => {

	getStore().dispatch({
		type: COORDINATE_UPDATED,
		payload: new EventLike(coordinate)
	});
};
