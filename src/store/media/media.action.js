/**
 * Action creators for media actions.
 * @module media/action
 */

import { $injector } from '../../injection';
import { MIN_WIDTH_CHANGED, ORIENTATION_CHANGED } from './media.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * 
 * @param {boolean} isPortait 
 * @function 
 */
export const setIsPortrait = (isPortait) => {
	getStore().dispatch({
		type: ORIENTATION_CHANGED,
		payload: isPortait
	});
};

/**
 * 
 * @param {boolean} isMinWidth 
 * @function 
 */
export const setIsMinWidth = (isMinWidth) => {
	getStore().dispatch({
		type: MIN_WIDTH_CHANGED,
		payload: isMinWidth
	});
};
