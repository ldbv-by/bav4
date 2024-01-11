/**
 * @module store/position/position_action
 */
import {
	ZOOM_CHANGED,
	CENTER_CHANGED,
	ZOOM_CENTER_CHANGED,
	FIT_REQUESTED,
	ROTATION_CHANGED,
	LIVE_ROTATION_CHANGED,
	ZOOM_CENTER_ROTATION_CHANGED,
	ZOOM_ROTATION_CHANGED,
	CENTER_ROTATION_CHANGED,
	FIT_LAYER_REQUESTED,
	LIVE_CENTER_CHANGED,
	LIVE_ZOOM_CHANGED
} from './position.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { roundCenter, roundRotation, roundZoomLevel } from '../../utils/mapUtils';

/**
 * Request for fitting a map to a geographic extent
 * @typedef {Object} FitRequest
 * @property {Extent} extent geographic extent in map projection
 * @property {FitRequestOptions} options options for this FitRequest
 */

/**
 * Options for a FitRequest.
 * @typedef {Object} FitRequestOptions
 * @property {number} maxZoom max zoom level that is set even if extent would result in a higher zoom level
 * @property {boolean} useVisibleViewport if `true` the map view is fitted by taking care of the currently visible viewport. Defaults to `true`.
 */

/**
 * A combination of zoom and center.
 * @typedef {Object} ZoomCenter
 * @property {number} zoom zoom level (will rounded to 3 decimal digits)
 * @property {Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 */

/**
 * A combination of zoom and rotation.
 * @typedef {Object} ZoomRotation
 * @property {number} zoom zoom level (will rounded to 3 decimal digits)
 * @property {number} rotation rotation in radians (will rounded to 5 decimal digits)
 */
/**
 * A combination of center and rotation.
 * @typedef {Object} CenterRotation
 * @property {Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @property {number} rotation rotation in radians (will rounded to 5 decimal digits)
 */

/**
 * A combination of zoom and center.
 * @typedef {Object} ZoomCenterRotation
 * @property {number} zoom zoom level (will rounded to 3 decimal digits)
 * @property {Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @property {number} rotation rotation in radians (will rounded to 5 decimal digits)
 */

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

const getMapService = () => {
	const { MapService: mapService } = $injector.inject('MapService');
	return mapService;
};

const getValidZoomLevelValue = (zoom) => {
	if (zoom > getMapService().getMaxZoomLevel()) {
		return getMapService().getMaxZoomLevel();
	}
	if (zoom < getMapService().getMinZoomLevel()) {
		return getMapService().getMinZoomLevel();
	}
	return roundZoomLevel(zoom);
};

/**
 * Changes the zoom level and the position.
 * @param {ZoomCenter} zoomCenter zoom and center
 * @function
 */
export const changeZoomAndCenter = (zoomCenter) => {
	const { zoom, center } = zoomCenter;
	getStore().dispatch({
		type: ZOOM_CENTER_CHANGED,
		payload: { center: roundCenter(center), zoom: getValidZoomLevelValue(zoom) }
	});
};

/**
 * Changes the zoom level and the rotation.
 * @param {ZoomRotation} zoomRotation zoom and rotation
 * @function
 */
export const changeZoomAndRotation = (zoomRotation) => {
	const { zoom, rotation } = zoomRotation;
	getStore().dispatch({
		type: ZOOM_ROTATION_CHANGED,
		payload: { rotation: roundRotation(rotation), zoom: getValidZoomLevelValue(zoom) }
	});
};

/**
 * Changes the center and the rotation.
 * @param {CenterRotation} centerRotation center and rotation
 * @function
 */
export const changeCenterAndRotation = (centerRotation) => {
	const { center, rotation } = centerRotation;
	getStore().dispatch({
		type: CENTER_ROTATION_CHANGED,
		payload: { center: roundCenter(center), rotation: roundRotation(rotation) }
	});
};

/**
 * Changes the zoom level, center and rotation
 * @param {ZoomCenterRotation} zoomCenterRotation zoom, center and rotation
 * @function
 */
export const changeZoomCenterAndRotation = (zoomCenterRotation) => {
	const { zoom, center, rotation } = zoomCenterRotation;
	getStore().dispatch({
		type: ZOOM_CENTER_ROTATION_CHANGED,
		payload: { zoom: getValidZoomLevelValue(zoom), center: roundCenter(center), rotation: roundRotation(rotation) }
	});
};

/**
 * Changes the zoom level.
 * @param {number} zoom zoom level (will rounded to 3 decimal digits)
 * @function
 */
export const changeZoom = (zoom) => {
	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: getValidZoomLevelValue(zoom)
	});
};

/**
 * Changes the live zoom level.
 * @param {number} zoom zoom level (will rounded to 3 decimal digits)
 * @function
 */
export const changeLiveZoom = (zoom) => {
	getStore().dispatch({
		type: LIVE_ZOOM_CHANGED,
		payload: getValidZoomLevelValue(zoom)
	});
};

/**
 * Changes the rotation value.
 * @param {number} rotation in radians (will rounded to 5 decimal digits)
 * @function
 */
export const changeRotation = (rotation) => {
	getStore().dispatch({
		type: ROTATION_CHANGED,
		payload: roundRotation(rotation)
	});
};

/**
 * Changes the live rotation value.
 * Typically called by a map component. State changes are consumed
 * by non-map components.
 * @param {number} liveRotation in radians (will rounded to 5 decimal digits)
 */
export const changeLiveRotation = (liveRotation) => {
	getStore().dispatch({
		type: LIVE_ROTATION_CHANGED,
		payload: roundRotation(liveRotation)
	});
};

/**
 * Increases zoom level by one.
 * @function
 */
export const increaseZoom = () => {
	const {
		position: { zoom }
	} = getStore().getState();
	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: getValidZoomLevelValue(zoom + 1)
	});
};

/**
 * Decreases zoom level by one.
 * @function
 */
export const decreaseZoom = () => {
	const {
		position: { zoom }
	} = getStore().getState();
	getStore().dispatch({
		type: ZOOM_CHANGED,
		payload: getValidZoomLevelValue(zoom - 1)
	});
};

/**
 * Changes the center.
 * @param {coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @function
 */
export const changeCenter = (center) => {
	getStore().dispatch({
		type: CENTER_CHANGED,
		payload: roundCenter(center)
	});
};

/**
 * Changes the live center value.
 * @param {coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @function
 */
export const changeLiveCenter = (center) => {
	getStore().dispatch({
		type: LIVE_CENTER_CHANGED,
		payload: roundCenter(center)
	});
};

const defaultFitOptions = {
	useVisibleViewport: true
};

/**
 * Sets a fit request.
 * The fitRequest object is wrapper by an {@link EventLike} object.
 * @param {extent} extent extent for this fit request
 * @param {FitRequestOptions} opts options for this fit request
 * @function
 */
export const fit = (extent, opts = {}) => {
	const options = { ...defaultFitOptions, ...opts };
	getStore().dispatch({
		type: FIT_REQUESTED,
		payload: new EventLike({ extent, options })
	});
};

/**
 * Sets a fit request for a layer.
 * The fitRequest object is wrapper by an {@link EventLike} object.
 * @param {string} id  id of the layer this fit request targets at
 * @param {FitRequestOptions} opts options for this fit request
 * @function
 */
export const fitLayer = (id, opts = {}) => {
	const options = { ...defaultFitOptions, ...opts };
	getStore().dispatch({
		type: FIT_LAYER_REQUESTED,
		payload: new EventLike({ id, options })
	});
};
