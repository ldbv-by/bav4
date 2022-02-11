import { $injector } from '../../injection';
import { IMPORT_DATA_ADDED, IMPORT_URL_ADDED } from './import.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

export const setUrl = (url) => {
	getStore().dispatch({
		type: IMPORT_URL_ADDED,
		payload: url
	});
};

export const setData = (data, mimeType) => {
	getStore().dispatch({
		type: IMPORT_DATA_ADDED,
		payload: { data: data, mimeType: mimeType }
	});
};
