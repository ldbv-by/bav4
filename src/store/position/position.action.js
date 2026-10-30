/**
 * @module store/position/position_action
 */

import { $injector } from '../../injection';
import { roundCenter, roundPitch, roundRoll, roundRotation, roundZoomLevel } from '../../utils/mapUtils';
import { EventLike } from '../../utils/storeUtils';
import {
	CENTER_CHANGED,
	CENTER_ROTATION_CHANGED,
	FIT_LAYER_REQUESTED,
	FIT_REQUESTED,
	LIVE_CENTER_CHANGED,
	LIVE_PITCH_CHANGED,
	LIVE_ROLL_CHANGED,
	LIVE_ROTATION_CHANGED,
	LIVE_ROTATION_PITCH_ROLL_CHANGED,
	LIVE_ZOOM_CENTER_ROTATION_PITCH_ROLL_CHANGED,
	LIVE_ZOOM_CHANGED,
	PITCH_CHANGED,
	ROLL_CHANGED,
	ROTATION_CHANGED,
	ZOOM_CENTER_CHANGED,
	ZOOM_CENTER_ROTATION_CHANGED,
	ZOOM_CENTER_ROTATION_PITCH_ROLL_CHANGED,
	ZOOM_CHANGED,
	ZOOM_ROTATION_CHANGED
} from './position.reducer';

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
 * A combination of zoom and rotation (~heading).
 * @typedef {Object} ZoomRotation
 * @property {number} zoom zoom level (will rounded to 3 decimal digits)
 * @property {number} rotation rotation (~heading) in radians counter-clock wise (will rounded to 5 decimal digits)
 */
/**
 * A combination of center and rotation (~heading).
 * @typedef {Object} CenterRotation
 * @property {Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @property {number} rotation rotation (~heading) in radians counter-clock wise (will rounded to 5 decimal digits)
 */

/**
 * A combination of zoom, center and rotation (~heading).
 * @typedef {Object} ZoomCenterRotation
 * @property {number} zoom zoom level (will rounded to 3 decimal digits)
 * @property {Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @property {number} rotation rotation (~heading) in radians counter-clock wise (will rounded to 5 decimal digits)
 */

/**
 * A combination of zoom, center, rotation (~heading), pitch and roll
 * @typedef {Object} ZoomCenterRotationPitchRoll
 * @property {number} zoom zoom level (will rounded to 3 decimal digits)
 * @property {Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
 * @property {number} rotation rotation (~heading) in radians counter-clock wise (will rounded to 5 decimal digits)
 * @property {number} pitch pitch in radians (will rounded to 5 decimal digits). 0 equals forward-view, −π/2 represents to nadir view
 * @property {number} roll roll in radians (will rounded to 5 decimal digits)
 */

/**
 * A combination of rotation (~heading), pitch and roll
 * @typedef {Object} RotationPitchRoll
 * @property {number} rotation rotation (~heading) in radians counter-clock wise (will rounded to 5 decimal digits)
 * @property {number} pitch pitch in radians (will rounded to 5 decimal digits). 0 equals forward-view, −π/2 represents to nadir view
 * @property {number} roll roll in radians (will rounded to 5 decimal digits)
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
 * @param {module:store/position/position_action~ZoomCenter} zoomCenter zoom and center
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
 * @param {module:store/position/position_action~ZoomRotation} zoomRotation zoom and rotation
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
 * @param {module:store/position/position_action~CenterRotation} centerRotation center and rotation
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
 * @param {module:store/position/position_action~ZoomCenterRotationPitchRoll} zoomCenterRotationPitchRoll zoom, center and rotation
 * @function
 */
export const changeZoomCenterRotationPitchRoll = (zoomCenterRotationPitchRoll) => {
	const { zoom, center, rotation, pitch, roll } = zoomCenterRotationPitchRoll;
	getStore().dispatch({
		type: ZOOM_CENTER_ROTATION_PITCH_ROLL_CHANGED,
		payload: {
			zoom: getValidZoomLevelValue(zoom),
			center: roundCenter(center),
			rotation: roundRotation(rotation),
			pitch: roundPitch(pitch),
			roll: roundRoll(roll)
		}
	});
};

/**
 * Changes the zoom level, center and rotation
 * @param {module:store/position/position_action~ZoomCenterRotation} zoomCenterRotation zoom, center and rotation
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
 * Changes the rotation (~heading) value.
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
 * Changes the live rotation (~heading) value.
 * Typically called by a map/globe component. State changes are consumed
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
 * Changes the pitch value.
 * @param {number} pitch in radians (will rounded to 5 decimal digits)
 * @function
 */
export const changePitch = (pitch) => {
	getStore().dispatch({
		type: PITCH_CHANGED,
		payload: roundPitch(pitch)
	});
};

/**
 * Changes the live pitch value.
 * Typically called by a map/globe component. State changes are consumed
 * by non-map components.
 * @param {number} livePitch in radians (will rounded to 5 decimal digits)
 */
export const changeLivePitch = (livePitch) => {
	getStore().dispatch({
		type: LIVE_PITCH_CHANGED,
		payload: roundPitch(livePitch)
	});
};

/**
 * Changes the roll value.
 * @param {number} roll in radians (will rounded to 5 decimal digits)
 * @function
 */
export const changeRoll = (roll) => {
	getStore().dispatch({
		type: ROLL_CHANGED,
		payload: roundRoll(roll)
	});
};

/**
 * Changes the live roll value.
 * Typically called by a map/globe component. State changes are consumed
 * by non-map components.
 * @param {number} liveRoll in radians (will rounded to 5 decimal digits)
 */
export const changeLiveRoll = (liveRoll) => {
	getStore().dispatch({
		type: LIVE_ROLL_CHANGED,
		payload: roundRoll(liveRoll)
	});
};

/**
 * Changes the live rotation (~heading), pitch and roll values.
 * Typically called by a map/globe component. State changes are consumed
 * by non-map components.
 * @param {RotationPitchRoll} liveRotationPitchRoll  rotation, pitch and roll
 */
export const changeLiveRotationPitchAndRoll = (liveRotationPitchRoll) => {
	const { rotation, pitch, roll } = liveRotationPitchRoll;
	getStore().dispatch({
		type: LIVE_ROTATION_PITCH_ROLL_CHANGED,
		payload: {
			rotation: roundRotation(rotation),
			pitch: roundPitch(pitch),
			roll: roundRoll(roll)
		}
	});
};

/**
 * Changes the live zoom, center, rotation (~heading), pitch and roll values.
 * Typically called by a map/globe component. State changes are consumed
 * by non-map components.
 * @param {ZoomCenterRotationPitchRoll} liveZoomCenterRotationPitchRoll  zoom. center, rotation, pitch and roll
 */
export const changeLiveZoomCenterRotationPitchAndRoll = (liveZoomCenterRotationPitchRoll) => {
	const { zoom, center, rotation, pitch, roll } = liveZoomCenterRotationPitchRoll;
	getStore().dispatch({
		type: LIVE_ZOOM_CENTER_ROTATION_PITCH_ROLL_CHANGED,
		payload: {
			zoom: getValidZoomLevelValue(zoom),
			center: roundCenter(center),
			rotation: roundRotation(rotation),
			pitch: roundPitch(pitch),
			roll: roundRoll(roll)
		}
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
 * @param {module:domain/coordinateTypeDef~Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
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
 * @param {module:domain/coordinateTypeDef~Coordinate} center coordinate in map projection (will rounded to 7 decimal digits)
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
 * @param {module:domain/extentTypeDef~Extent} extent extent for this fit request
 * @param {module:store/position/position_action~FitRequestOptions} opts options for this fit request
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
 * @param {module:store/position/position_action~FitRequestOptions} opts options for this fit request
 * @function
 */
export const fitLayer = (id, opts = {}) => {
	const options = { ...defaultFitOptions, ...opts };
	getStore().dispatch({
		type: FIT_LAYER_REQUESTED,
		payload: new EventLike({ id, options })
	});
};
