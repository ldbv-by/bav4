/**
 * @module store/highlight/highlight_action
 */
import { CLEAR_FEATURES, FEATURE_ADD, REMOVE_FEATURE_BY_ID } from './highlight.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Adds (appends) a single or an array of {@link HighlightFeature}.
 * @param {Array.<module:domain/highlightFeature~HighlightFeature>|module:domain/highlightFeature~HighlightFeature} features
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
