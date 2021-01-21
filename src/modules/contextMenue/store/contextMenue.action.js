/**
 * Action creators to change/update the properties of contextMenue state.
 * @module contextMenue/action
 */
import { CONTEXT_MENUE_CLICK } from './contextMenue.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the contextMenue.
 * @function
 */
export const contextMenueOpen = (contextMenuData) => {
	getStore().dispatch({
		type: CONTEXT_MENUE_CLICK,
		payload: contextMenuData
	});
};

/**
 * Closes the contextMenue.
 * @function
 */
export const contextMenueClose = () => {
	getStore().dispatch({
		type: CONTEXT_MENUE_CLICK,
		payload: { pointer: false, commands: false }
	});
};