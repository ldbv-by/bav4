/**
 * Action creators to change/update the properties of bottom sheet state.
 * @module bottomSheet/action
 */
import { BOTTOM_SHEET_CHANGED } from './bottomSheet.reducer';
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
export const openBottomSheet = (content) => {

	getStore().dispatch({
		type: BOTTOM_SHEET_CHANGED,
		payload: content
	});
};

/**
 * Closes the bottom sheet.
 * @function
 */
export const closeBottomSheet = () => {
	getStore().dispatch({
		type: BOTTOM_SHEET_CHANGED,
		payload: null
	});
};

