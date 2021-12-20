/**
 * Action creators to change/update the state of the main menu.
 * @module mainMenu/action
 */
import { OPEN_CLOSED_CHANGED, INDEX_CHANGED } from './mainMenu.reducer';
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
 *Available menu tabs.
 @enum
 */
export const TabKey = Object.freeze({
	TOPICS: '0',
	MAPS: '1',
	MORE: '2',
	ROUTING: '3',
	SEARCH: '4',
	FEATUREINFO: '5'
});

/**
 * Displays the tab for a given key.
 * @see {@link TabKey}
 * @param {number} key
 */
export const setTab = (key) => {
	getStore().dispatch({
		type: INDEX_CHANGED,
		payload: key
	});
};
