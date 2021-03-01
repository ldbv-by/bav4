/**
 * Action creators to change/update the properties of map state.
 * @module map/action
 */
import { ZOOM_CHANGED, CENTER_CHANGED, ZOOM_CENTER_CHANGED, POINTER_POSITION_CHANGED, FIT_REQUESTED } from './position.reducer';
import { $injector } from '../../../injection';
import { EventLike } from '../../../utils/storeUtils';


/**
 * Request for fitting a map to a geographic extent
 * @typedef {Object} FitRequest
 * @property {Extent} extent geographic extent
 */

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
 * Sets a fit request.
 * The fitRequest object is wrapper by an {@link EventLike} object.
 * @param {FitRequest} fitRequest
 * @function
 */
export const setFit = (fitRequest) => {
	getStore().dispatch({
		type: FIT_REQUESTED,
		payload: new EventLike(fitRequest)
	});
};

