/**
 * Action creators to activate/deactive the measurement tool
 * @module map/action
 */
import { ACTIVE_CHANGED, STATISTIC_CHANGED, RESET_REQUESTED, REMOVE_REQUESTED } from './measurement.reducer';
import { $injector } from '../../../injection';
import { EventLike } from '../../../utils/storeUtils';


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};


/**
 * Activates the measurement tool.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Deactivates the measurement tool.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};


/**
 * set the statistic of a measurement.
 * @function
 */
export const setStatistic = (stat) => {
	getStore().dispatch({
		type: STATISTIC_CHANGED,
		payload: stat
	});
};

/**
 * set the reset request.
 * @function
 */
export const reset = () => {
	getStore().dispatch({
		type: RESET_REQUESTED,
		payload: new EventLike('reset')
	});
};

/**
 * set the delete request.
 * @function
 */
export const remove = () => {
	getStore().dispatch({
		type: REMOVE_REQUESTED,
		payload: new EventLike('remove')
	});
};