/**
 * Action creators to change/update the state of the Toolbar.
 * @module toolbox/action
 */
import { OPEN_CLOSED_CHANGED } from './toolBar.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * Opens the Toolbar.
 * @function
 */
export const openToolBar = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the Toolbar.
 * @function
 */
export const closeToolBar = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility of the Toolbar.
 * @function
 */
export const toggleToolBar = () => {
	const { toolBar: { open } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};
