/**
 * @module store/legends/legends_action
 */

import { $injector } from '@src/injection';
import { LEGEND_ADDED, LEGEND_REMOVED, LEGENDS_CLEARED } from './legends.reducer';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Adds geoResourceIds to the active legend store.
 * @function
 * @param {string | string[]} geoResourceIds
 */
export const addLegends = (geoResourceIds) => {
	getStore().dispatch({
		type: LEGEND_ADDED,
		payload: geoResourceIds
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
