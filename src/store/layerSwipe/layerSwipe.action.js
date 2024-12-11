/**
 * @module store/navigationRail/navigationRail_action
 */
import { ACTIVE_CHANGED, LAYER_RANGE_CHANGED, LAYER_SIDE_CHANGED, LAYER_IDS } from './layerSwipe.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Activate the LayerSwipe component
 * @function
 */
export const active = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Toggles the visibility the NavigationRail component
 * @function
 */
export const toggle = () => {
	const {
		layerSwipe: { active }
	} = getStore().getState();
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: !active
	});
};

/**
 * Deactivate the LayerSwipe component
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};

/**
 * @param {number} range
 */
export const changeRange = (range) => {
	getStore().dispatch({
		type: LAYER_RANGE_CHANGED,
		payload: range
	});
};

export const changeLayerSideEvent = (id, side) => {
	getStore().dispatch({
		type: LAYER_SIDE_CHANGED,
		payload: new EventLike({ id, side })
	});
};

export const addMapId = (layerId, side) => {
	getStore().dispatch({
		type: LAYER_IDS,
		payload: [layerId, side]
	});
};
