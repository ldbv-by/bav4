/**
 * @module store/map/map_action
 */
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { BEING_MOVED_CHANGED, MOVE_START_CHANGED, MOVE_END_CHANGED } from './map.reducer';

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
 * Sets information wether moving the map starts
 * @function
 */
export const setMoveStart = () => {
	getStore().dispatch({
		type: MOVE_START_CHANGED,
		payload: new EventLike('movestart')
	});
};

/**
 * Sets information wether moving the map ends
 * @function
 */
export const setMoveEnd = () => {
	getStore().dispatch({
		type: MOVE_END_CHANGED,
		payload: new EventLike('moveend')
	});
};

/**
 * Sets information wether map is being moved
 * @function
 * @param {boolean} moved
 */
export const setBeingMoved = (moved) => {
	getStore().dispatch({
		type: BEING_MOVED_CHANGED,
		payload: moved
	});
};
