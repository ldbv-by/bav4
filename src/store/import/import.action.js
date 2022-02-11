import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { IMPORT_ADDED } from './import.reducer';


/**
 * Request for fitting a map to a geographic extent
 * @typedef {Object} ImportOption
 * @property {String|null} data the data to import
 * @property {String|null} mimeType the mimeType of the data-property
 * @property {String|null} url the url to a file-like resource
 */

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

export const setUrl = (url) => {
	getStore().dispatch({
		type: IMPORT_ADDED,
		payload: new EventLike({ url: url })
	});
};

export const setData = (data, mimeType) => {
	getStore().dispatch({
		type: IMPORT_ADDED,
		payload: new EventLike({ data: data, mimeType: mimeType })
	});
};
