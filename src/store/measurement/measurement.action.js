/**
 * @module store/measurement/measurement_action
 */
import {
	ACTIVE_CHANGED,
	STATISTIC_CHANGED,
	MODE_CHANGED,
	RESET_REQUESTED,
	FINISH_REQUESTED,
	REMOVE_REQUESTED,
	SELECTION_CHANGED
} from './measurement.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

/**
 * Statistic data of a geometry object.
 * @typedef {Object} MeasurementStatistic
 * @property {module:domain/coordinateTypeDef~Coordinate} coordinate the coordinate of the feature
 * @property {number} azimuth the horizontal angle in degree of the line feature
 * @property {number} length the length in meter of the feature(s)
 * @property {number} area the area in squaremeter of the feature(s)
 */

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Activates the measurement tool.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the measurement tool.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};

/**
 * set the statistic of a measurement.
 * @function
 * @param {MeasurementStatistic} stat the measurement-statistic of the current selected feature(s)
 */
export const setStatistic = (stat) => {
	getStore().dispatch({
		type: STATISTIC_CHANGED,
		payload: stat
	});
};

/**
 * set the mode of a measurement.
 * @function
 */
export const setMode = (mode) => {
	getStore().dispatch({
		type: MODE_CHANGED,
		payload: mode
	});
};

/**
 * set the list of ids of selected measurement features
 * @function
 * @param {Array<String>} selection the list of the ids of selected measurement-features
 */
export const setSelection = (selection) => {
	getStore().dispatch({
		type: SELECTION_CHANGED,
		payload: selection
	});
};

/**
 * set the reset request.
 * @function
 */
export const reset = () => {
	getStore().dispatch({
		type: RESET_REQUESTED,
		payload: new EventLike('reset')
	});
};

/**
 * set the reset request.
 * @function
 */
export const finish = () => {
	getStore().dispatch({
		type: FINISH_REQUESTED,
		payload: new EventLike('finish')
	});
};

/**
 * set the delete request.
 * @function
 */
export const remove = () => {
	getStore().dispatch({
		type: REMOVE_REQUESTED,
		payload: new EventLike('remove')
	});
};
