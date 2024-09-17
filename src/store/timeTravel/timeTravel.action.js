/**
 * @module store/topics/topics_action
 */
import { $injector } from '../../injection';
import { TIME_TRAVEL_ACTIVE_CHANGED, TIME_TRAVEL_TIMESTAMP_CHANGED } from './timeTravel.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets the current timestamp.
 * @param {string} timestamp id of the current topic
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
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: TIME_TRAVEL_ACTIVE_CHANGED,
		payload: true
	});
};
/**
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: TIME_TRAVEL_ACTIVE_CHANGED,
		payload: false
	});
};
