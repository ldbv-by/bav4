/**
 * @module store/timeTravel/timeTravel_action
 */
import { $injector } from '../../injection';
import { TIME_TRAVEL_ACTIVE_CHANGED, TIME_TRAVEL_TIMESTAMP_CHANGED } from './timeTravel.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets the current timestamp.
 * @param {string} timestamp the new timestamp
 * @function
 */
export const setCurrentTimestamp = (timestamp) => {
	getStore().dispatch({
		type: TIME_TRAVEL_TIMESTAMP_CHANGED,
		payload: timestamp
	});
};

/**
 *
 * Opens the time slider for a dedicated timestamp
 * @param {string} timestamp
 * @function
 */
export const openSlider = (timestamp) => {
	getStore().dispatch({
		type: TIME_TRAVEL_ACTIVE_CHANGED,
		payload: { active: true, timestamp }
	});
};
/**
 *
 * Closes the slider
 * @function
 */
export const closeSlider = () => {
	getStore().dispatch({
		type: TIME_TRAVEL_ACTIVE_CHANGED,
		payload: { active: false, timestamp: null }
	});
};
