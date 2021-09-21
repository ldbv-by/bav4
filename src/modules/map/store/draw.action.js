/**
 * Action creators to activate/deactive the drwa tool
 * @module map/action
 */
import { ACTIVE_CHANGED, MODE_CHANGED, TYPE_CHANGED, RESET_REQUESTED, FINISH_REQUESTED, REMOVE_REQUESTED, FILE_SAVE_RESULT_CHANGED, STYLE_CHANGED, SELECTED_STYLE_CHANGED, DESCRIPTION_CHANGED } from './draw.reducer';
import { $injector } from '../../../injection';
import { EventLike } from '../../../utils/storeUtils';


/**
 * MetaData of a successfully saved drawing (@see {@link FileSaveResult}).
 * @typedef {Object} DrawFileSaveResult
 * @property {string} adminId The adminId of the succesfully saved drawing
 * @property {string} fileId The fileId of the succesfully saved drawing
 */

/**
 * the Options of a Style-Request
 * @typedef {Object} DrawingStyleOption
 * @property {string} symbolSrc the source of a vector graphic, used by a symbol-drawing
 * @property {small|medium|big} scale the scale-factor of a drawing; used by symbol- and text-drawing
 * @property {string} color the hex-string representation of a RGB-Color; used by Symbol-, Text-, Line- and Polygon-drawing
 * @property {string} text the text-content of a Text-drawing
 */

/**
 * the style-options for a selected drawing
 * @typedef SelectedDrawingStyleOption
 * @property {string} type the type of the selected drawing
 * @property {DrawingStyleOption} style the styleOptions of the selected drawing
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
 * set the style of a drawing.
 * @function
 */
export const setStyle = (style) => {
	getStore().dispatch({
		type: STYLE_CHANGED,
		payload: style
	});
};

/**
 * set the style of a drawing.
 * @function
 * @param {SelectedDrawingStyleOption} selectedStyle the styleOptions of the selected drawing
 */
export const setSelectedStyle = (selectedSyle) => {
	getStore().dispatch({
		type: SELECTED_STYLE_CHANGED,
		payload: selectedSyle
	});
};


/**
 * set the description of a drawing.
 * @function
 * @param {string} description the description of a drawing
 */
export const setDescription = (description) => {
	getStore().dispatch({
		type: DESCRIPTION_CHANGED,
		payload: description
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
