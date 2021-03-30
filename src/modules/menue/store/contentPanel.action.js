/**
 * Action creators to change/update the state of the content panel.
 * @module menu/action
 */
import { OPEN_CLOSED_CHANGED } from './contentPanel.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * Opens the content panel.
 * @function
 */
export const openContentPanel = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the content panel.
 * @function
 */
export const closeContentPanel = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility of the content panel.
 * @function
 */
export const toggleContentPanel = () => {
	const { contentPanel: { open } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};
