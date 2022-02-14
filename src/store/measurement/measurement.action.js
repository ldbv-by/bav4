/**
 * Action creators to activate/deactive the measurement tool
 * @module measurement/action
 */
import { ACTIVE_CHANGED, STATISTIC_CHANGED, MODE_CHANGED, RESET_REQUESTED, FINISH_REQUESTED, REMOVE_REQUESTED, FILE_SAVE_RESULT_CHANGED, SELECTION_CHANGED } from './measurement.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

/**
 * Statistic-data of a measurement.
 * @typedef {Object} MeasureStatistic
 * @property {number} length the length in meter of the feature(s)
 * @property {number} area the area in squaremeter of the feature(s)
 */

/**
 * MetaData of a successfully saved measurement (@see {@link FileSaveResult}).
 * @typedef {Object} MeasureFileSaveResult
 * @property {string} adminId The adminId of the succesfully saved measurement
 * @property {string} fileId The fileId of the succesfully saved measurement
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
 * @param {MeasureStatistic} stat the measurement-statistic of the current selected feature(s)
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
 * set the {@link FileSaveResult}
 * @function
 * @param {MeasureFileSaveResult} fileSaveResult the fileSaveResult of the stored measurement-data
 */
export const setFileSaveResult = (fileSaveResult) => {
	getStore().dispatch({
		type: FILE_SAVE_RESULT_CHANGED,
		payload: fileSaveResult
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
