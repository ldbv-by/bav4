/**
 * Action creators to change/update the state of the main menu.
 * @module mainMenu/action
 */
import { OPEN_CLOSED_CHANGED, TAB_CHANGED } from './mainMenu.reducer';
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
	TOPICS: 'topics',
	MAPS: 'maps',
	MORE: 'more',
	ROUTING: 'routing',
	SEARCH: 'search',
	FEATUREINFO: 'featureinfo'
});

/**
 * Displays the tab for a given key.
 * @see {@link TabKey}
 * @param {number} key
 */
export const setTab = (key) => {
	getStore().dispatch({
		type: TAB_CHANGED,
		payload: key
	});
};
