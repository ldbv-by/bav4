/**
 * Action creators to activate/deactive the drwa tool
 * @module map/action
 */
import { ACTIVE_CHANGED, MODE_CHANGED, TYPE_CHANGED, RESET_REQUESTED, FINISH_REQUESTED, REMOVE_REQUESTED, FILE_SAVE_RESULT_CHANGED } from './draw.reducer';
import { $injector } from '../../../injection';
import { EventLike } from '../../../utils/storeUtils';


/**
 * MetaData of a successfully saved drawing (@see {@link FileSaveResult}).
 * @typedef {Object} DrawFileSaveResult
 * @property {string} adminId The adminId of the succesfully saved drawing
 * @property {string} fileId The fileId of the succesfully saved drawing
 */


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Activates the draw tool.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the draw tool.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};


/**
 * set the mode of a drawing.
 * @function
 */
export const setMode = (mode) => {
	getStore().dispatch({
		type: MODE_CHANGED,
		payload: mode
	});
};

/**
 * set the type of a drawing.
 * @function
 */
export const setType = (type) => {
	getStore().dispatch({
		type: TYPE_CHANGED,
		payload: type
	});
};


/**
 * set the {@link FileSaveResult}
 * @function
 * @param {DrawFileSaveResult} fileSaveResult the fileSaveResult of the stored drawing-data
 */
export const setFileSaveResult = (fileSaveResult) => {
	getStore().dispatch({
		type: FILE_SAVE_RESULT_CHANGED,
		payload: fileSaveResult
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