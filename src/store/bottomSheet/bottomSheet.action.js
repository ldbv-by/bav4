/**
 * @module store/bottomSheet/bottomSheet_action
 */
import { BOTTOM_SHEET_CHANGED, DEFAULT_BOTTOM_SHEET_ID } from './bottomSheet.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the bottom sheet.
 * @param {string|TemplateResult} content  The content of the bottom sheet. Could either be a a plain string or a lit-html TemplateResult.
 * @function
 */
export const openBottomSheet = (content, id = DEFAULT_BOTTOM_SHEET_ID) => {
	getStore().dispatch({
		type: BOTTOM_SHEET_CHANGED,
		payload: { id: id, content: content }
	});
};

/**
 * Closes the bottom sheet.
 * @function
 */
export const closeBottomSheet = (id = DEFAULT_BOTTOM_SHEET_ID) => {
	console.log('closeBottomSheet', id);
	getStore().dispatch({
		type: BOTTOM_SHEET_CHANGED,
		payload: { id: id, content: null }
	});
};
