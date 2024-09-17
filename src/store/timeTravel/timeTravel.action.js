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
 * Sets the `active` property
 * @param {boolean} active
 * @function
 */
export const updateActivity = (active) => {
	getStore().dispatch({
		type: TIME_TRAVEL_ACTIVE_CHANGED,
		payload: active
	});
};
