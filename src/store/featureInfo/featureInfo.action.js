/**
 * Action creators to change/update the properties of featureInfo state.
 * @module featureInfo/action
 */
import { FEATURE_INFO_ADDED, FEATURE_INFO_CLEARED } from './featureInfo.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * FeatureInfo
 * @typedef {Object} FeatureInfo
 * @property {string} title The Title of this FeatureInfo
 * @property {string|TemplateResult} content Teh content of this FeatureInfo
 */


/**
  * Adds a  {@link FeatureInfo} item
  * @param {FeatureInfo} featureInfo
  */
export const add = (featureInfo) => {

	getStore().dispatch({
		type: FEATURE_INFO_ADDED,
		payload: featureInfo
	});
};

/**
  * Removes all  {@link FeatureInfo} items
  * @param {FeatureInfo} featureInfo
  */
export const clear = () => {

	getStore().dispatch({
		type: FEATURE_INFO_CLEARED
	});
};
