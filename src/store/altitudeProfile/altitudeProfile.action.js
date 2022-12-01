/**
 * Action creators to change/update the properties of altitudeProfile state.
 * @module altitudeProfile/action
 */
import { $injector } from '../../injection';
import { ALTITUDE_PROFILE_ACTIVE_CHANGED, ALTITUDE_PROFILE_COORDINATES_CHANGED } from './altitudeProfile.reducer';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
 * Opens the profile component.
 * @param {Array<Coordinate>} [coordinates]  the coordinates for the calculation of the altitude profile
 * @function
 */

export const openProfile = (coordinates = []) => {

	getStore().dispatch({
		type: ALTITUDE_PROFILE_ACTIVE_CHANGED,
		payload: {
			active: true,
			coordinates: coordinates
		}
	});
};

export const updateCoordinates = (coordinates) => {
	getStore().dispatch({
		type: ALTITUDE_PROFILE_COORDINATES_CHANGED,
		payload: coordinates
	});
};

export const closeProfile = () => {

	getStore().dispatch({
		type: ALTITUDE_PROFILE_ACTIVE_CHANGED,
		payload: {
			active: false
		}
	});
};

