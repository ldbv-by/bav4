/**
 * Action creators to change/update the properties concerning the zoom level and center of a map.
 * @module map/action
 */
import { ZOOM_CHANGED, CENTER_CHANGED, ZOOM_CENTER_CHANGED, FIT_REQUESTED } from './position.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';


/**
 * Request for fitting a map to a geographic extent
 * @typedef {Object} FitRequest
 * @property {Extent} extent geographic extent in map projection
 * @property {FitRequestOptions} options options for this FitRequest
 */

/**
 * Options for a FitRequest.
 * @typedef {Object} FitRequestOptions
 * @property {maxZoom} maxZoom max zoom level that is set even if extent would result in a higher zoom level
 */

/**
* A combination of zoom and center.
* @typedef {Object} ZoomCenter
* @property {number} zoom zoom level
* @property {Coordinate} coordinate coordinate in map projection
*/

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Changes zoom level and the position.
 * @param {ZoomCenter} zoomCenter zoom and center
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
 * @param {number} zoom zoom level
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
 * @param {coordinate} center coordinate in map projection
 * @function
 */
export const changeCenter = (center) => {
	getStore().dispatch({
		type: CENTER_CHANGED,
		payload: center
	});
};

/**
 * Sets a fit request.
 * The fitRequest object is wrapper by an {@link EventLike} object.
 * @param {extent} extent extent for this fit request
 * @param {FitRequestOptions} options options for this fit request
 * @function
 */
export const setFit = (extent, options = {}) => {
	getStore().dispatch({
		type: FIT_REQUESTED,
		payload: new EventLike({ extent, options })
	});
};

