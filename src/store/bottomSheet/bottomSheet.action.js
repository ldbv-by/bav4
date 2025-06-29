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
 *
 * Opens the bottom sheet.
 * @function
 * @param {string|TemplateResult} content  The content of the bottom sheet. Could either be a a plain string or a lit-html TemplateResult.
 * @param {string} [id] The identifier of a specific BottomSheet
 */
export const openBottomSheet = (content, id = DEFAULT_BOTTOM_SHEET_ID) => {
	getStore().dispatch({
		type: BOTTOM_SHEET_CHANGED,
		payload: { id: id, content: content }
	});
};

/**
 * Closes the bottom sheet.
 * @param {string} [id] The identifier of a specific BottomSheet
 * @function
 */
export const closeBottomSheet = (id = DEFAULT_BOTTOM_SHEET_ID) => {
	getStore().dispatch({
		type: BOTTOM_SHEET_CHANGED,
		payload: { id: id, content: null }
	});
};
