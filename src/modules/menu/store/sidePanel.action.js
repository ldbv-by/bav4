/**
 * Action creators to change/update the properties of sidePanel state.
 * @module menu/action
 */
import { OPEN_CLOSED_CHANGED } from './sidePanel.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * Opens the sidePanel.
 * @function
 */
export const openSidePanel = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the sidePanel.
 * @function
 */
export const closeSidePanel = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false

	});
};

/**
 * Toggles the sidePanel.
 * @function
 */
export const toggleSidePanel = () => {
	const { sidePanel: { open } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open

	});
};


