/**
 * Action creators to activate/deactive the draw tool
 * @module draw/action
 */
import {
	ACTIVE_CHANGED,
	MODE_CHANGED,
	TYPE_CHANGED,
	RESET_REQUESTED,
	FINISH_REQUESTED,
	REMOVE_REQUESTED,
	FILE_SAVE_RESULT_CHANGED,
	STYLE_CHANGED,
	SELECTED_STYLE_CHANGED,
	DESCRIPTION_CHANGED,
	GEOMETRY_IS_VALID_CHANGED,
	SELECTION_CHANGED,
	CLEAR_DESCRIPTION,
	CLEAR_TEXT
} from './draw.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

/**
 * MetaData and content of a successfully saved drawing (@see {@link FileSaveResult}).
 * @typedef {Object} DrawFileSaveResult
 * @property {FileSaveResult} fileSaveResult the FileSaveResult
 * @property {string} content the content (geometry) that was saved
 */

/**
 * The Options of a Style-Request
 * @typedef {Object} DrawingStyleOption
 * @property {string} symbolSrc the source of a vector graphic, used by a symbol-drawing
 * @property {small|medium|large} scale the scale-factor of a drawing; used by symbol- and text-drawing
 * @property {string} color the hex-string representation of a RGB-Color; used by Symbol-, Text-, Line- and Polygon-drawing
 * @property {string} text the text-content of a Text-drawing
 */

/**
 * The style-options for a selected drawing
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
export const activate = (createPermanentLayer = true) => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: { active: true, createPermanentLayer: createPermanentLayer }
	});
};

/**
 * Deactivates the draw tool.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: { active: false, createPermanentLayer: true }
	});
};

/**
 * Set the mode of a drawing.
 * @function
 */
export const setMode = (mode) => {
	getStore().dispatch({
		type: MODE_CHANGED,
		payload: mode
	});
};

/**
 * Set the type of a drawing.
 * @function
 */
export const setType = (type) => {
	getStore().dispatch({
		type: TYPE_CHANGED,
		payload: type
	});
};

/**
 * Set whether the geometry of a drawing is valid or not.
 * @function
 */
export const setGeometryIsValid = (isValid) => {
	getStore().dispatch({
		type: GEOMETRY_IS_VALID_CHANGED,
		payload: isValid
	});
};

/**
 * Set the style of a drawing.
 * @function
 */
export const setStyle = (style) => {
	getStore().dispatch({
		type: STYLE_CHANGED,
		payload: style
	});
};

/**
 * Set the style of a drawing.
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
 * Set the description of a drawing.
 * @function
 * @param {string} description the description of a drawing
 */
export const setDescription = (description) => {
	getStore().dispatch({
		type: DESCRIPTION_CHANGED,
		payload: description
	});
};

export const clearDescription = () => {
	getStore().dispatch({
		type: CLEAR_DESCRIPTION
	});
};

export const clearText = () => {
	getStore().dispatch({
		type: CLEAR_TEXT
	});
};

/**
 * Set the {@link FileSaveResult}
 * @function
 * @param {DrawFileSaveResult} fileSaveResult the fileSaveResult of the stored drawing-data
 */
export const setFileSaveResult = (fileSaveResult) => {
	getStore().dispatch({
		type: FILE_SAVE_RESULT_CHANGED,
		payload: new EventLike(fileSaveResult)
	});
};

/**
 * set the list of ids of selected draw-features
 * @function
 * @param {Array<String>} selection the list of the ids of selected draw-features
 */
export const setSelection = (selection) => {
	getStore().dispatch({
		type: SELECTION_CHANGED,
		payload: selection
	});
};

/**
 * Set the reset request.
 * @function
 */
export const reset = () => {
	getStore().dispatch({
		type: RESET_REQUESTED,
		payload: new EventLike('reset')
	});
};

/**
 * Set the reset request.
 * @function
 */
export const finish = () => {
	getStore().dispatch({
		type: FINISH_REQUESTED,
		payload: new EventLike('finish')
	});
};

/**
 * Set the delete request.
 * @function
 */
export const remove = () => {
	getStore().dispatch({
		type: REMOVE_REQUESTED,
		payload: new EventLike('remove')
	});
};
