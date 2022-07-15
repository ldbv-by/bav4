/**
 * @typedef {Object} MapSize
 * @property {number} width
 * @property {number} height
 */

import { $injector } from '../../injection';
import { ACTIVE_CHANGED, MAP_SIZE_CHANGED, SCALE_CHANGED } from './mfp.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};


/**
 * Activates the mfp tool.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the mfp tool.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};

export const setScale = (scale) => {
	getStore().dispatch({
		type: SCALE_CHANGED,
		payload: scale
	});
};

/**
 * @param {MapSize} mapSize
 */
export const setMapSize = (mapSize) => {
	getStore().dispatch({
		type: MAP_SIZE_CHANGED,
		payload: mapSize
	});
};
