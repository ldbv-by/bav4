/**
 * Action creators concerning pointer based interactions of the user.
 * @module pointer/action
 */

import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { BEING_DRAGGED_CHANGED, CLICK_CHANGED, CONTEXT_CLICK_CHANGED, POINTER_MOVE_CHANGED } from './pointer.reducer';

/**
* @typedef {Object} PointerEvent
* @param {number[]} coordinate Of the last click expressed in EPSG:3857
* @param {number[]} screenCoordinate Of the last click expressed pixel
*/


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets information about the last click that occurred on the map.
 * @function
 * @param {PointerEvent} pointerEvent
 */
export const setClick = (pointerEvent) => {
	getStore().dispatch({
		type: CLICK_CHANGED,
		payload: new EventLike(pointerEvent)
	});
};

/**
 * Sets information about the last context click that occurred on the map.
 * @function
 * @param {PointerEvent} pointerEvent
 */
export const setContextClick = (pointerEvent) => {
	getStore().dispatch({
		type: CONTEXT_CLICK_CHANGED,
		payload: new EventLike(pointerEvent)
	});
};

/**
 * Sets information about the last pointer move occurred on the map.
 * @function
 * @param {PointerEvent} pointerEvent
 */
export const setPointerMove = (pointerEvent) => {
	getStore().dispatch({
		type: POINTER_MOVE_CHANGED,
		payload: new EventLike(pointerEvent)
	});
};

/**
 * Sets information wether the pointer is being dragged.
 * @function
 * @param {boolean} dragged
 */
export const setBeingDragged = (dragged) => {
	getStore().dispatch({
		type: BEING_DRAGGED_CHANGED,
		payload: dragged
	});
};

