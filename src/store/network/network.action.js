/**
 * @module store/network/network_action
 */
import { FETCHING_CHANGED, OFFLINE_CHANGED } from './network.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Updates the fetching property.
 * @function
 * @param {boolean} fetching
 */
export const setFetching = (fetching) => {
	getStore().dispatch({
		type: FETCHING_CHANGED,
		payload: fetching
	});
};

/**
 * Updates the offline property.
 * @function
 * @param {boolean} offline
 */
export const setOffline = (offline) => {
	getStore().dispatch({
		type: OFFLINE_CHANGED,
		payload: offline
	});
};
