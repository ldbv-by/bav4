/**
 * Action creators for geolocation.
 * @module geolocation/action
 */
import { ACTIVE_CHANGED, DENIED_CHANGED, TRACKING_CHANGED, ACCURACY_CHANGED, POSITION_CHANGED } from './geolocation.reducer';
import { $injector } from '../../injection';


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};


/**
 * Activates the geolocation functionality.
 * @function
 */
export const activate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: true
	});
};

/**
 * Dectivates the geolocation functionality.
 * @function
 */
export const deactivate = () => {
	getStore().dispatch({
		type: ACTIVE_CHANGED,
		payload: false
	});
};

/**
 *
 * @function
 * @param {boolean} denied
 */
export const setDenied = (denied) => {
	getStore().dispatch({
		type: DENIED_CHANGED,
		payload: denied
	});
};

/**
 *
 * @function
 * @param {boolean} tracking
 */
export const setTracking = (tracking) => {
	getStore().dispatch({
		type: TRACKING_CHANGED,
		payload: tracking
	});
};

/**
 *
 * @function
 * @param {number} accuracy
 */
export const setAccuracy = (accuracy) => {
	getStore().dispatch({
		type: ACCURACY_CHANGED,
		payload: accuracy
	});
};

/**
 *
 * @function
 * @param {Coordinate} position in 3857
 */
export const setPosition = (position) => {
	getStore().dispatch({
		type: POSITION_CHANGED,
		payload: position
	});
};
