/**
 * @module store/import/import_action
 */
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { IMPORT_ADDED } from './import.reducer';

/**
 * Properties for a import of GeoResources
 * @typedef {Object} ImportProperties
 * @property {String|null} data the data to import
 * @property {SourceType} sourceType the {@link SourceType} of the data-property
 * @property {String|null} url the url to a file-like resource
 */

const defaultImportProperties = { url: null, data: null, sourceType: null };

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * @function
 * @param {string} url
 * @param {SourceType} sourceType
 */
export const setUrl = (url, sourceType) => {
	getStore().dispatch({
		type: IMPORT_ADDED,
		payload: new EventLike({ ...defaultImportProperties, url: url, sourceType: sourceType })
	});
};

/**
 * @function
 * @param {string} data
 * @param {SourceType} sourceType
 */
export const setData = (data, sourceType) => {
	getStore().dispatch({
		type: IMPORT_ADDED,
		payload: new EventLike({ ...defaultImportProperties, data: data, sourceType: sourceType })
	});
};
