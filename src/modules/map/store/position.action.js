/**
 * Action creators to change/update the properties of map state.
 * @module map/action
 */
import { ZOOM_CHANGED, CENTER_CHANGED, ZOOM_CENTER_CHANGED, POINTER_POSITION_CHANGED, FIT_REQUESTED } from './position.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Changes zoom level and the position.
 * @function
 */
export const changeZoomAndCenter = (zoomCenter) => {
	getStore().dispatch({
		type: ZOOM_CENTER_CHANGED,
		payload: zoomCenter
	});
};

/**
 * Changes zoom level.
 * @function
 */
export const changeZoom = (zoom) => {
	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: zoom

	});
};


/**
 * Increases zoom level by one.
 * @function
 */
export const increaseZoom = () => {

	const { position: { zoom } } = getStore().getState();
	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: zoom + 1

	});
};

/**
 * Decreases zoom level by one.
 * @function
 */
export const decreaseZoom = () => {

	const { position: { zoom } } = getStore().getState();
	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: zoom - 1

	});
};

/**
 * Changes the center.
 * @function
 */
export const changeCenter = (center) => {
	getStore().dispatch({
		type: CENTER_CHANGED,
		payload: center
	});
};

/**
 * Updates the pointer position.
 * @function
 */
export const updatePointerPosition = (position) => {
	getStore().dispatch({
		type: POINTER_POSITION_CHANGED,
		payload: position
	});
};

/**
 * Fits the position to an extent.
 * @function
 */
export const fit = (fitRequest) => {
	getStore().dispatch({
		type: FIT_REQUESTED,
		payload: fitRequest
	});
};

/**
 * Resets a fit request. Typically called from a map only.
 */
export const resetFitRequest = () => {
	getStore().dispatch({
		type: FIT_REQUESTED,
		payload: null
	});
};
