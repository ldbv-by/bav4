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
export const Tool = Object.freeze({
	MEASURING: 'measuring',
	DRAWING: 'drawing',
	SHARING: 'sharing'
});


/**
 * Sets the content to the specified content-id.
 * @function
 */
export const setContainerContent = (toolId) => {
	getStore().dispatch({
		type: CURRENT_TOOL_CHANGED,
		payload: toolId
	});
};
