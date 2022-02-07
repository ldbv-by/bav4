/**
 * Action creators to change/update the state of the Toolbox.
 * @module toolContainer/action
 */
import { CURRENT_TOOL_CHANGED } from './tools.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 *Available tools.
 * @enum
 */
export const ToolId = Object.freeze({
	MEASURING: 'measuring',
	DRAWING: 'drawing',
	SHARING: 'sharing',
	IMPORT: 'import'
});



/**
 * Sets the current active tool. A value of `null` will disable an currently active tool.
 * @param {string|null} toolId
 */
export const setCurrentTool = (toolId) => {
	getStore().dispatch({
		type: CURRENT_TOOL_CHANGED,
		payload: toolId
	});
};
