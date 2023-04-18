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
	const {
		mainMenu: { open }
	} = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};

/**
 *Available menu tabs.
 @enum
 */
export const TabId = Object.freeze({
	TOPICS: 'topics',
	MAPS: 'maps',
	MISC: 'misc',
	ROUTING: 'routing',
	SEARCH: 'search',
	FEATUREINFO: 'featureinfo',
	valueOf: (index) => {
		switch (index) {
			case 0:
				return TabId.TOPICS;
			case 1:
				return TabId.MAPS;
			case 2:
				return TabId.SEARCH;
			case 3:
				return TabId.ROUTING;
			case 4:
				return TabId.MISC;
			case 5:
				return TabId.FEATUREINFO;
		}
		return null;
	}
});

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
