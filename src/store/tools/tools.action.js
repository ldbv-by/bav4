/**
 * Action creators to change/update the state of the Toolbox.
 * @module toolContainer/action
 */
import { CONTENT_CHANGED } from './tools.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 *Available tools.
 * @enum
 */
export const ToolKey = Object.freeze({
	MEASURING: 'measuring',
	DRAWING: 'drawing',
	SHARING: 'sharing'
});


/**
 * Sets the content to the specified content-id.
 * @function
 */
export const setContainerContent = (contentId) => {
	getStore().dispatch({
		type: CONTENT_CHANGED,
		payload: contentId
	});
};
