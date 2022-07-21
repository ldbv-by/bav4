/**
 * @typedef {Object} MfpSetting
 * @property {string} id
 * @property {number} scale
 * @property {number} dpi
 */

import { $injector } from '../../injection';
import { ACTIVE_CHANGED, CURRENT_CHANGED, ID_CHANGED, SCALE_CHANGED } from './mfp.reducer';

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

/**
 *
 * @param {number} scale
 */
export const setScale = (scale) => {
	getStore().dispatch({
		type: SCALE_CHANGED,
		payload: scale
	});
};

/**
 * @param {string} id
 */
export const setId = (id) => {
	getStore().dispatch({
		type: ID_CHANGED,
		payload: id
	});
};

/**
 * @param {MfpSetting} setting
 */
export const setCurrent = (setting) => {
	getStore().dispatch({
		type: CURRENT_CHANGED,
		payload: setting
	});
};
