/**
 * @module service/provider
 */
import { $injector } from '../../injection';


/**
 * A function that takes a coordinate and returns a promise with a number. 
 *
 * @typedef {function(coordinate) : (Promise<number>)} altitudeProvider
 */

/**
 * Uses the BVV service to load an altitude.
 * @function
 * @param {coordinate} coordinate3857
 * @returns {number} altitude loaded from backend
 */
export const loadBvvAltitude = async (coordinate3857) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/altitude';


	const result = await httpService.get(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`);

	if (result.ok) {
		const payload = await result.json();
		const altitude = payload.altitude;
		if (Number.isFinite(altitude)) {
			return altitude;
		} 
	}
	throw new Error('Altitude could not be retrieved');
};