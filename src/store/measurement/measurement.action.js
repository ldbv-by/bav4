/**
 * @module store/measurement/measurement_action
 */

import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import {
	ACTIVE_CHANGED,
	DISPLAY_RULER_CHANGED,
	EXTEND_LINE_REQUESTED,
	FINISH_REQUESTED,
	MODE_CHANGED,
	REMOVE_REQUESTED,
	RESET_REQUESTED,
	SELECTION_CHANGED,
	STATISTIC_CHANGED
} from './measurement.reducer';

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
 * @param {module:domain/geometryStatisticTypeDef~GeometryStatistic} stat the measurement-statistic of the current selected feature(s)
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
 * activates/deactivates the display of the partition overlays.
 * @function
 */
export const setDisplayRuler = (displayRuler) => {
	getStore().dispatch({
		type: DISPLAY_RULER_CHANGED,
		payload: displayRuler
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
 * set the remove request.
 * @function
 */
export const remove = () => {
	getStore().dispatch({
		type: REMOVE_REQUESTED,
		payload: new EventLike('remove')
	});
};

/**
 * Set the extendLine request.
 * @function
 */
export const extendLine = () => {
	getStore().dispatch({
		type: EXTEND_LINE_REQUESTED,
		payload: new EventLike('extend_line')
	});
};
