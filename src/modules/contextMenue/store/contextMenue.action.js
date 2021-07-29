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
 * A pointer representing a location in (x,y) coordinate space, specified in integer precision for the display.
 * @typedef {Object} Point
 * @property {number} [x] The X coordinate of this Point.
 * @property {number} [y] The Y coordinate of this Point.
 */

/**
 *
 * @typedef {Object} Command
 * @property {String} [label] The Label of this command.
 * @property {String} [shortcut] The Keyboard-Shortcut (optional) of this Command.
 * @property {function} [action1] The Callback to call, if the user select this command.
 */

/**
 * Properties to display the contextmenu at a specific point with specific entries
 * @typedef {Object} ContextMenuData
 * @property {Point} [pointer] The Pointer, a location, where the contextmenu should be placed.
 * @property {Command[]} [commands] The list of available commands, to show in the contextmenu.
 */

/**
 * Opens the contextMenue.
 * @function
 * @param {ContextMenuData} contextMenuData the data to display the contextmenu at a specific point with specific entries
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
