/**
 * @module store/legends/legends_action
 */

import { $injector } from '../../injection';
import { LEGEND_ADDED, LEGEND_REMOVED, LEGENDS_CLEARED } from './legends.reducer';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Adds a geoResourceId to the active legend store.
 * @function
 * @param {string} geoResourceId
 */
export const addLegend = (geoResourceId) => {
	getStore().dispatch({
		type: LEGEND_ADDED,
		payload: geoResourceId
	});
};

/**
 * Removes a geoResourceId from the active legend store.
 * @function
 * @param {string} geoResourceId
 */
export const removeLegend = (geoResourceId) => {
	getStore().dispatch({
		type: LEGEND_REMOVED,
		payload: geoResourceId
	});
};

/**
 * Clears all geoResourceIds from the active legend store.
 * @function
 */
export const clearLegends = () => {
	getStore().dispatch({
		type: LEGENDS_CLEARED,
		payload: null
	});
};
