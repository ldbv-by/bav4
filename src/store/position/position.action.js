/**
 * Action creators to change/update the properties concerning the zoom level and center of a map.
 * @module position/action
 */
import { ZOOM_CHANGED, CENTER_CHANGED, ZOOM_CENTER_CHANGED, FIT_REQUESTED, ROTATION_CHANGED, LIVE_ROTATION_CHANGED, ZOOM_CENTER_ROTATION_CHANGED, ZOOM_ROTATION_CHANGED, CENTER_ROTATION_CHANGED } from './position.reducer';
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

/**
* A combination of zoom and rotation.
* @typedef {Object} ZoomRotation
* @property {number} zoom zoom level
* @property {number} rotation rotation in radians
*/
/**
* A combination of center and rotation.
* @typedef {Object} CenterRotation
* @property {Coordinate} coordinate coordinate in map projection
* @property {number} rotation rotation in radians
*/

/**
* A combination of zoom and center.
* @typedef {Object} ZoomCenterRotation
* @property {number} zoom zoom level
* @property {Coordinate} coordinate coordinate in map projection
* @property {number} rotation rotation in radians
*/

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

const getMapService = () => {
	const { MapService: mapService } = $injector.inject('MapService');
	return mapService;
};

const getValidZoomLevel = zoom => {
	if (zoom > getMapService().getMaxZoomLevel()) {
		return getMapService().getMaxZoomLevel();
	}
	if (zoom < getMapService().getMinZoomLevel()) {
		return getMapService().getMinZoomLevel();
	}
	return zoom;
};

/**
 * Changes the zoom level and the position.
 * @param {ZoomCenter} zoomCenter zoom and center
 * @function
 */
export const changeZoomAndCenter = (zoomCenter) => {
	const { zoom } = zoomCenter;

	getStore().dispatch({
		type: ZOOM_CENTER_CHANGED,
		payload: { ...zoomCenter, zoom: getValidZoomLevel(zoom) }
	});
};

/**
 * Changes the zoom level and the rotation.
 * @param {ZoomRotation} zoomRotation zoom and rotation
 * @function
 */
export const changeZoomAndRotation = (zoomRotation) => {
	const { zoom } = zoomRotation;

	getStore().dispatch({
		type: ZOOM_ROTATION_CHANGED,
		payload: { ...zoomRotation, zoom: getValidZoomLevel(zoom) }
	});
};

/**
 * Changes the center and the rotation.
 * @param {CenterRotation} centerRotation center and rotation
 * @function
 */
export const changeCenterAndRotation = (centerRotation) => {
	getStore().dispatch({
		type: CENTER_ROTATION_CHANGED,
		payload: centerRotation
	});
};


/**
 * Changes the zoom level, center and rotation
 * @param {ZoomCenterRotation} zoomCenterRotation zoom, center and rotation
 * @function
 */
export const changeZoomCenterAndRotation = (zoomCenterRotation) => {
	const { zoom } = zoomCenterRotation;

	getStore().dispatch({
		type: ZOOM_CENTER_ROTATION_CHANGED,
		payload: { ...zoomCenterRotation, zoom: getValidZoomLevel(zoom) }
	});
};

/**
 * Changes the zoom level.
 * @param {number} zoom zoom level
 * @function
 */
export const changeZoom = (zoom) => {

	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: getValidZoomLevel(zoom)
	});
};

/**
 * Changes the rotation value.
 * @param {number} rotation in radians
 * @function
 */
export const changeRotation = (rotation) => {
	getStore().dispatch({
		type: ROTATION_CHANGED,
		payload: rotation
	});
};

/**
 * Changes the live rotation value.
 * Typically called by a map component. State changes are consumed
 * by non-map components.
 * @param {number} liveRotation in radians
 */
export const changeLiveRotation = (liveRotation) => {
	getStore().dispatch({
		type: LIVE_ROTATION_CHANGED,
		payload: liveRotation
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
		payload: getValidZoomLevel(zoom + 1)

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
		payload: getValidZoomLevel(zoom - 1)

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
export const fit = (extent, options = {}) => {
	getStore().dispatch({
		type: FIT_REQUESTED,
		payload: new EventLike({ extent, options })
	});
};

