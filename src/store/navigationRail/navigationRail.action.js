/**
 * @module store/navigationRail/navigationRail_action
 */
import { OPEN_CLOSED_CHANGED, ADD_TAB_ID } from './navigationRail.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the NavigationRail component
 * @function
 */
export const open = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the NavigationRail component
 * @function
 */
export const close = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility the NavigationRail component
 * @function
 */
export const toggle = () => {
	const {
		navigationRail: { open }
	} = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};

/**
 * Registers a tab for the the NavigationRail component
 * @param {string} tabId
 */
export const addTabId = (tabId) => {
	getStore().dispatch({
		type: ADD_TAB_ID,
		payload: tabId
	});
};
