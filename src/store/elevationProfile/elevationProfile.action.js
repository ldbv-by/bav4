/**
 * @module store/elevationProfile/elevationProfile_action
 */
import { $injector } from '../../injection';
import { isCoordinateLike } from '../../utils/checks';
import { ELEVATION_PROFILE_ACTIVE_CHANGED, ELEVATION_PROFILE_COORDINATES_CHANGED } from './elevationProfile.reducer';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the profile component. Does nothing when `coordinates` contains invalid values.
 * @param {Array<module:domain/coordinateTypeDef~CoordinateLike>} [coordinates] The coordinates for the calculation of the elevation profile
 * @function
 */
export const openProfile = (coordinates = []) => {
	if (coordinates.filter((c) => !isCoordinateLike(c)).length === 0) {
		getStore().dispatch({
			type: ELEVATION_PROFILE_ACTIVE_CHANGED,
			payload: {
				active: true,
				coordinates: coordinates
			}
		});
	}
};

/**
 * Updates the coordinates of the elevation profile. Does nothing when `coordinates` contains invalid values.
 * @param {Array<module:domain/coordinateTypeDef~CoordinateLike>} coordinates The coordinates for the calculation of the elevation profile
 * @function
 */
export const updateCoordinates = (coordinates) => {
	if (coordinates.filter((c) => !isCoordinateLike(c)).length === 0) {
		getStore().dispatch({
			type: ELEVATION_PROFILE_COORDINATES_CHANGED,
			payload: coordinates
		});
	}
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
