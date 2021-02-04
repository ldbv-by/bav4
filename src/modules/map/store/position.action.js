/**
 * Action creators to change/update the properties of map state.
 * @module map/action
 */
import { ZOOM_CHANGED, POSITION_CHANGED, ZOOM_POSITION_CHANGED, POINTER_POSITION_CHANGED } from './position.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Changes zoom level and the position.
 * @function
 */
export const changeZoomAndPosition = (zoomPosition) => {
	getStore().dispatch({
		type: ZOOM_POSITION_CHANGED,
		payload: zoomPosition
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
 * Changes the position.
 * @function
 */
export const changePosition = (position) => {
	getStore().dispatch({
		type: POSITION_CHANGED,
		payload: position
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
