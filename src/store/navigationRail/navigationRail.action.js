/**
 * @module store/navigationRail/navigationRail_action
 */
import { OPENNAV_CLOSEDNAV_CHANGED, ADD_TAB_ID } from './navigationRail.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the main menu.
 * @function
 */
export const open = () => {
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: true
	});
};

/**
 * Closes the main menu.
 * @function
 */
export const close = () => {
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility of the main menu.
 * @function
 */
export const toggle = () => {
	const {
		navigationRail: { open }
	} = getStore().getState();
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: !open
	});
};

export const addTabId = (tabId) => {
	getStore().dispatch({
		type: ADD_TAB_ID,
		payload: tabId
	});
};
