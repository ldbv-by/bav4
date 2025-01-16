/**
 * @module store/layerSwipe/layerSwipe_action
 */
import { ACTIVE_CHANGED, RATIO_VALUE_CHANGED } from './layerSwipe.reducer';
import { $injector } from '../../injection';
import { isNumber } from '../../utils/checks';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Activates the layers swipe feature
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the layer swipe feature
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};

/**
 * Toggles the activity of the layer swipe feature
 * @function
 * @deprecated
 */
export const toggle = () => {
	const {
		layerSwipe: { active }
	} = getStore().getState();
	active ? deactivate() : activate();
};

/**
 * Updates the ratio value.
 * @function
 * @param {number} ratio in percent [0-100]
 */
export const updateRatio = (ratio) => {
	if (isNumber(ratio) && ratio >= 0 && ratio <= 100) {
		getStore().dispatch({
			type: RATIO_VALUE_CHANGED,
			payload: ratio
		});
	}
};
