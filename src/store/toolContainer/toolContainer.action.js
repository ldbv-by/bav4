/**
 * Action creators to change/update the state of the Toolbox.
 * @module toolContainer/action
 */
import { OPEN_CLOSED_CHANGED, CONTENT_CHANGED } from './toolContainer.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


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

/**
 * Opens the Toolbox.
 * @function
 */
export const openToolContainer = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the Toolbox.
 * @function
 */
export const closeToolContainer = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility of the Toolbox.
 * @function
 */
export const toggleToolContainer = () => {
	const { toolContainer: { open } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};
