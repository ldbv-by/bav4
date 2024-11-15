/**
 * @module store/mfp/mfp_action
 */
/**
 * @typedef {Object} MfpConstraint
 * @property {string} id
 * @property {number} scale
 * @property {number} dpi
 */

import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import {
	ACTIVE_CHANGED,
	CURRENT_CHANGED,
	GRID_SUPPORTED_CHANGED,
	EXPORT_SUPPORTED_CHANGED,
	ID_CHANGED,
	JOB_REQUEST_CHANGED,
	JOB_SPEC_CHANGED,
	SCALE_CHANGED,
	SHOW_GRID_CHANGED
} from './mfp.reducer';

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
 * Updates the current mfp constraint.
 * @param {MfpConstraint} setting
 */
export const setCurrent = (setting) => {
	getStore().dispatch({
		type: CURRENT_CHANGED,
		payload: setting
	});
};

/**
 * Updates the showGrid property.
 * @param {boolean} isActive Whether activates the MFP map grid or not.
 */
export const setShowGrid = (isActive) => {
	getStore().dispatch({
		type: SHOW_GRID_CHANGED,
		payload: isActive
	});
};

/**
 * Updates the gridSupported property.
 * @param {boolean} isSupported Whether a coordinate grid is supported in the MFP map or not.
 */
export const setGridSupported = (isSupported) => {
	getStore().dispatch({
		type: GRID_SUPPORTED_CHANGED,
		payload: isSupported
	});
};

/**
 * Updates the exportSupported property.
 * @param {boolean} isSupported Whether an export is supported in the MFP map or not.
 */
export const setExportSupported = (isSupported) => {
	getStore().dispatch({
		type: EXPORT_SUPPORTED_CHANGED,
		payload: isSupported
	});
};

/**
 * Places a new job request.
 * @function
 */
export const requestJob = () => {
	getStore().dispatch({
		type: JOB_REQUEST_CHANGED,
		payload: new EventLike(null)
	});
};

/**
 * Starts a new job by adding a mfp spec.
 * @param {object} mfp spec
 * @function
 */
export const startJob = (spec) => {
	getStore().dispatch({
		type: JOB_SPEC_CHANGED,
		payload: new EventLike(spec)
	});
};

/**
 * Cancels a currently running job.
 * @function
 */
export const cancelJob = () => {
	getStore().dispatch({
		type: JOB_SPEC_CHANGED,
		payload: new EventLike(null)
	});
};
