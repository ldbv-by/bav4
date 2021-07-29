/**
 * Action creators to change/update the state of the main menu.
 * @module menu/action
 */
import { OPEN_CLOSED_CHANGED, INDEX_CHANGED } from './mainMenu.reducer';
import { $injector } from '../../../injection';

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
 * Toggles the visibility of the main menu.
 * @function
 */
export const toggle = () => {
	const { mainMenu: { open } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};

/**
 * Displays the tab for this index.
 * @param {MainMenuTabIndex} index
 */
export const setTabIndex = (index) => {
	getStore().dispatch({
		type: INDEX_CHANGED,
		payload: index.id
	});
};
