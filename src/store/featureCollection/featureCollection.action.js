/**
 * @module store/featureCollection/featureCollection_action
 */
import { CLEAR_FEATURES, FEATURE_ADD, REMOVE_FEATURE_BY_ID } from './featureCollection.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Adds (appends) a single or an array of {@link BaFeature}.
 * @param {Array.<BaFeature>|BaFeature} features
 * @function
 */
export const addFeatures = (features) => {
	const featureAsArray = Array.isArray(features) ? [...features] : [features];
	getStore().dispatch({
		type: FEATURE_ADD,
		payload: featureAsArray
	});
};

/**
 * Removes all {@link BaFeature}s.
 * @function
 */
export const clearFeatures = () => {
	getStore().dispatch({
		type: CLEAR_FEATURES
	});
};

/**
 * Removes a (permanent or temporary) feature by its id.
 * If two or more feature have the same id, all of them are removed.
 * @param {Array.<String>|String} id The id of a feature
 * @function
 */
export const removeFeaturesById = (id) => {
	const idsAsArray = Array.isArray(id) ? [...id] : [id];
	getStore().dispatch({
		type: REMOVE_FEATURE_BY_ID,
		payload: idsAsArray
	});
};
