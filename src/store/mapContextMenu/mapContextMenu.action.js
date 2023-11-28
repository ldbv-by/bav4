/**
 * @module store/mapContextMenu/mapContextMenu_action
 */
import { MAP_CONTEXT_MENU_CHANGED, MAP_CONTEXT_MENU_CONTENT_CHANGED } from './mapContextMenu.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * A screen coordinate representing a location in (x,y) coordinate space, specified in integer precision.
 * @typedef {Array<number>} ScreenCoordinate
 */

/**
 * Properties to display the contextmenu at a specific point with specific entries
 * @typedef {Object} ContextMenuData
 * @property {ScreenCoordinate} [screenCoordinates] Location (in screen coordinates) where the contextmenu should be placed.
 * @property {string|TemplateResult} content The content
 */

/**
 * Opens the ContextMenu.
 * @function
 * @param {ContextMenuData} content the data to display the contextmenu at a specific point with specific entries
 */
export const openContextMenu = (coordinate, content) => {
	getStore().dispatch({
		type: MAP_CONTEXT_MENU_CHANGED,
		payload: { coordinate: coordinate, content: content }
	});
};

/**
 * Updates the content of the ContextMenu.
 * @param {string|TemplateResult} content
 */
export const updateContextMenu = (content) => {
	getStore().dispatch({
		type: MAP_CONTEXT_MENU_CONTENT_CHANGED,
		payload: content
	});
};

/**
 * Closes the ContextMenu.
 * @function
 */
export const closeContextMenu = () => {
	getStore().dispatch({
		type: MAP_CONTEXT_MENU_CHANGED,
		payload: { coordinate: null, content: null }
	});
};
