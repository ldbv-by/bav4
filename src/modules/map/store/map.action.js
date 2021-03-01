/**
 * Action creators to update state concerning map related information
 * @module map/action
 */

import { $injector } from '../../../injection';
import { EventLike } from '../../../utils/storeUtils';
import { BEING_DRAGGED_CHANGED, CLICK_CHANGED, CONTEXT_CLICK_CHANGED } from './map.reducer';

/**
* @typedef {Object} Click
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
 * @param {Click} click 
 */
export const setClick = (click) => {
	getStore().dispatch({
		type: CLICK_CHANGED,
		payload: new EventLike(click)
	});
};

/**
 * Sets information about the last context click that occurred on the map.
 * @function
 * @param {Click} click 
 */
export const setContextClick = (click) => {
	getStore().dispatch({
		type: CONTEXT_CLICK_CHANGED,
		payload: new EventLike(click)
	});
};

/**
 * Sets information wether map is being dragged.
 * @function
 * @param {boolean} dragged 
 */
export const setBeingDragged = (dragged) => {
	getStore().dispatch({
		type: BEING_DRAGGED_CHANGED,
		payload: dragged
	});
};