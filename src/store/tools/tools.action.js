/**
 * @module store/tools/tools_action
 */
import { CURRENT_TOOL_CHANGED } from './tools.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Sets the current active tool. A value of `null` will disable an currently active tool.
 * @function
 * @param {string|null} toolId
 */
export const setCurrentTool = (toolId) => {
	getStore().dispatch({
		type: CURRENT_TOOL_CHANGED,
		payload: toolId
	});
};

/**
 * Sets the current active tool. If the current tool is already active it will be disabled.
 * @function
 * @param {string|null} toolId
 */
export const toggleCurrentTool = (toolId) => {
	const {
		tools: { current }
	} = getStore().getState();

	getStore().dispatch({
		type: CURRENT_TOOL_CHANGED,
		payload: current === toolId ? null : toolId
	});
};
