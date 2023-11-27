/**
 * @module store/navigationRail/navigationRail_action
 */
import { OPENNAV_CLOSEDNAV_CHANGED } from './navigationRail.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the main menu.
 * @function
 */
export const openNav = () => {
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: true
	});
};

/**
 * Closes the main menu.
 * @function
 */
export const closeNav = () => {
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: false
	});
};

/**
 * Toggles the visibility of the main menu.
 * @function
 */
export const toggleNav = () => {
	const {
		navigationRail: { openNav }
	} = getStore().getState();
	getStore().dispatch({
		type: OPENNAV_CLOSEDNAV_CHANGED,
		payload: !openNav
	});
};
