/**
 * Action creators to change/update the state of the Toolbox.
 * @module menu/action
 */
import { OPEN_CLOSED_CHANGED } from './toolBox.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * Opens the Toolbox.
 * @function
 */
export const openToolBox = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

/**
 * Closes the Toolbox.
 * @function
 */
export const closeToolBox = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility of the Toolbox.
 * @function
 */
export const toggleToolBox = () => {
	const { toolBox: { open } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open
	});
};
