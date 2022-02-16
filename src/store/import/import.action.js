import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { IMPORT_ADDED } from './import.reducer';


/**
 * Properties for a import of vectorDataResources
 * @typedef {Object} ImportProperties
 * @property {String|null} data the data to import
 * @property {String|null} mimeType the mimeType of the data-property
 * @property {String|null} url the url to a file-like resource
 */

const defaultImportProperties = { url: null, data: null, mimeType: null };


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

export const setUrl = (url) => {
	getStore().dispatch({
		type: IMPORT_ADDED,
		payload: new EventLike({ ...defaultImportProperties, url: url })
	});
};

export const setData = (data, mimeType) => {
	getStore().dispatch({
		type: IMPORT_ADDED,
		payload: new EventLike({ ...defaultImportProperties, data: data, mimeType: mimeType })
	});
};
