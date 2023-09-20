/**
 * @module store/mainMenu/mainMenu_action
 */
import { OPEN_CLOSED_CHANGED, TAB_CHANGED, OPENNAV_CLOSEDNAV_CHANGED } from './mainMenu.reducer';
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
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the main menu.
 * @function
 */
export const close = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false
	});
};
/**
 * Opens the main menu.
 * @function
 */
export const openNav = () => {
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: true
	});
};

/**
 * Closes the main menu.
 * @function
 */
export const closeNav = () => {
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
		mainMenu: { open }
	} = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};

/**
 * Toggles the visibility of the main menu.
 * @function
 */
export const toggleNav = () => {
	const {
		mainMenu: { openNav }
	} = getStore().getState();
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: !openNav
	});
};

/**
 * Displays the tab for a given key.
 * @see {@link TabId}
 * @param {number} key
 */
export const setTab = (key) => {
	getStore().dispatch({
		type: TAB_CHANGED,
		payload: key
	});
};
