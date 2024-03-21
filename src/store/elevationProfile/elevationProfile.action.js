/**
 * @module store/elevationProfile/elevationProfile_action
 */
import { $injector } from '../../injection';
import { ELEVATION_PROFILE_ACTIVE_CHANGED, ELEVATION_PROFILE_CHANGED } from './elevationProfile.reducer';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the profile component.
 * @function
 */
export const openProfile = () => {
	getStore().dispatch({
		type: ELEVATION_PROFILE_ACTIVE_CHANGED,
		payload: {
			active: true
		}
	});
};

/**
 * Closes the profile component.
 * @function
 */
export const closeProfile = () => {
	getStore().dispatch({
		type: ELEVATION_PROFILE_ACTIVE_CHANGED,
		payload: {
			active: false
		}
	});
};

/**
 * Indicates that the elevation profile changed.
 * @param {string} id identifier of the new profile
 * @function
 */
export const indicateChange = (id) => {
	getStore().dispatch({
		type: ELEVATION_PROFILE_CHANGED,
		payload: id
	});
};
