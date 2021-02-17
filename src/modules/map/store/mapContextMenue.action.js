/**
 * Action creators to change/update the properties of contextMenue state.
 * @module contextMenue/action
 */
import { MAP_CONTEXT_MENUE_CLICKED } from './mapContextMenue.reducer';
import { $injector } from '../../../injection';

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
 * @property {string} [id] Content of the context menue element
 */

/**
 * Opens the contextMenue.
 * @function
 * @param {ContextMenuData} contextMenuData the data to display the contextmenu at a specific point with specific entries
 */
export const open = (coordinate, id) => {
	getStore().dispatch({
		type: MAP_CONTEXT_MENUE_CLICKED,
		payload: { coordinate: coordinate, id : id }
	});
};

/**
 * Closes the contextMenue.
 * @function
 */
export const close = () => {
	getStore().dispatch({
		type: MAP_CONTEXT_MENUE_CLICKED,
		payload:  { coordinate: null }
	});
};